using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web_API.Data;
using Web_API.Dto;
using Web_API.Model;
using Web_API.Services;

namespace Web_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private IUserService _userService;
        private UserManager<User> _userManager;
        private IServiceProvider _serviceProvider;
        private DataContext _dataContext;



        public CartController(IUserService userService, UserManager<User> userManager, IServiceProvider serviceProvider, DataContext dataContext)
        {
            _userService = userService;
            _userManager = userManager;
            _serviceProvider = serviceProvider;
            _dataContext = dataContext;
        }

        [HttpGet("{userId}/items")]
        public async Task<IActionResult> GetCartItems(String userId)
        {
            var cart = await _dataContext.Carts
                                     .Include(c => c.Cartitems)
                                     .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (cart == null)
            {
                return NotFound(new { message = "No cart found for this user." });
            }

            var cartItemsDto = cart.Cartitems.Select(ci => new CartItemDto
            {
                CartItemId = ci.CartItemId,
                VehicleId = ci.VehicleId,
                UserId=ci.UserId,
                DailyRate = ci.DailyRate,
                StartDate = ci.StartDate,
                EndDate = ci.EndDate,
                TotalPrice = ci.TotalPrice,
                Deleted= ci.Deleted
            }).ToList();

            return Ok(cartItemsDto);
        }

        [HttpGet("items/{itemId}")]
        public async Task<IActionResult> GetCartItemById(int itemId)
        {
            var cartItem = await _dataContext.CartItems
                                     .FirstOrDefaultAsync(c => c.CartItemId == itemId && c.Deleted == 0);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }


            return Ok(cartItem);
        }

        [HttpPost("{userId}/add-item")]
        public async Task<IActionResult> AddCartItem(string userId, int vehicleId, double dailyRate, DateTime startDate, DateTime endDate)
        {
            if (startDate >= endDate)
            {
                return BadRequest(new { message = "The end date must be after the start date." });
            }

            var overlappingItem = await _dataContext.CartItems
                .Include(ci => ci.Cart)
                .Where(ci => ci.VehicleId == vehicleId &&
                             ci.Cart.Status == "Open" &&
                             (startDate < ci.EndDate && endDate > ci.StartDate))
                .FirstOrDefaultAsync();

            if (overlappingItem != null)
            {
                return BadRequest(new { message = "The rental period overlaps with an existing booking for this vehicle." });
            }


            var cart = await _dataContext.Carts
                .Include(c => c.Cartitems)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedDate = DateTime.Now,
                    Status = "Open",
                    Cartitems = new List<CartItem>()
                };

                _dataContext.Carts.Add(cart);
                await _dataContext.SaveChangesAsync();
            }

            var existingItem = cart.Cartitems.FirstOrDefault(ci => ci.VehicleId == vehicleId &&
                (startDate < ci.EndDate && endDate > ci.StartDate));

            if (existingItem != null)
            {
                return BadRequest(new { message = "The rental period overlaps with an existing booking in a cart." });
            }

            if (existingItem == null)
            {
                var cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    VehicleId = vehicleId,
                    UserId= userId, 
                    DailyRate = dailyRate,
                    StartDate = startDate,
                    EndDate = endDate,
                    TotalPrice = dailyRate * (endDate - startDate).Days
                };

                _dataContext.CartItems.Add(cartItem);
            }
       

            try
            {
                await _dataContext.SaveChangesAsync();
                return Ok(new { message = "Item added to the cart successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, new { message = "An error occurred while adding the item to the cart." });
            }
        }

        [HttpPost("{userId}/remove-item/{cartItemId}")]
        public async Task<IActionResult> RemoveCartItem(String userId, int cartItemId)
        {
            var cart = await _dataContext.Carts
                                     .Include(c => c.Cartitems)
                                     .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (cart == null)
            {
                return NotFound(new { message = "No open cart found for this user." });
            }

            var cartItem = cart.Cartitems.FirstOrDefault(ci => ci.CartItemId == cartItemId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Item not found in the cart." });
            }

            _dataContext.CartItems.Remove(cartItem);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Item removed from the cart successfully." });
        }

        [HttpPost("{userId}/update-item/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(String userId, int cartItemId, [FromBody] CartItemDto updateDto)
        {
            var cart = await _dataContext.Carts
                                     .Include(c => c.Cartitems)
                                     .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (cart == null)
            {
                return NotFound(new { message = "No open cart found for this user." });
            }

            var cartItem = cart.Cartitems.FirstOrDefault(ci => ci.CartItemId == cartItemId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            var overlappingItem = await _dataContext.CartItems
                                 .Include(ci => ci.Cart)
                                 .Where(ci => ci.VehicleId == cartItem.VehicleId &&
                                              ci.Cart.Status == "Open" &&
                                              ci.CartItemId != cartItemId && 
                                              (updateDto.StartDate < ci.EndDate && updateDto.EndDate > ci.StartDate)) // Check for overlap
                                 .FirstOrDefaultAsync();

            if (overlappingItem != null)
            {
                return BadRequest(new { message = "The selected vehicle is already booked during the specified date range." });
            }

            cartItem.StartDate = updateDto.StartDate;
            cartItem.EndDate = updateDto.EndDate;
            cartItem.DailyRate = updateDto.DailyRate;
            cartItem.TotalPrice = cartItem.DailyRate * (cartItem.EndDate - cartItem.StartDate).Days;
            cartItem.Deleted = updateDto.Deleted;

            _dataContext.CartItems.Update(cartItem);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart item updated successfully." });
        }

        [HttpPost("delete/{itemId}")]
        public async Task<IActionResult> MarkCartItemAsDeleted(int itemId)
        {
            var cartItem = await _dataContext.CartItems.FirstOrDefaultAsync(c => c.CartItemId == itemId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            cartItem.Deleted = 1;

            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart item deleted successfully." });
        }

        [HttpPost("{userId}/checkout")]
        public async Task<IActionResult> CheckoutCart(string userId)
        {
            var cart = await _dataContext.Carts
                                          .Include(c => c.Cartitems)
                                          .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Open");

            if (cart == null)
            {
                return NotFound(new { message = "No open cart found for this user." });
            }

            cart.Status = "Pending";
            _dataContext.Carts.Update(cart);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart status updated to Pending." });
        }
        [HttpPost("{cartId}/check-out")]
        public async Task<IActionResult> CheckOutCart(int cartId)
        {
            var cart = await _dataContext.Carts
                                          .FirstOrDefaultAsync(c => c.CartId == cartId && c.Status == "Pending");

            if (cart == null)
            {
                return NotFound(new { message = "No pending cart found with this ID." });
            }

            cart.Status = "Checked Out";
            _dataContext.Carts.Update(cart);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart status updated to Checked Out." });
        }

        [HttpPost("{cartId}/check-in")]
        public async Task<IActionResult> CheckInCart(int cartId)
        {
            var cart = await _dataContext.Carts
                                          .FirstOrDefaultAsync(c => c.CartId == cartId && c.Status == "Checked Out");

            if (cart == null)
            {
                return NotFound(new { message = "No checked-out cart found with this ID." });
            }

            cart.Status = "Checked In";
            _dataContext.Carts.Update(cart);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart status updated to Checked In." });
        }

        [HttpGet("{userId}/invoice")]
        public async Task<IActionResult> GetInvoice(string userId)
        {
            var cart = await _dataContext.Carts
                                          .Include(c => c.Cartitems)
                                          .ThenInclude(ci => ci.Vehicle) 
                                          .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Pending");

            if (cart == null)
            {
                return NotFound(new { message = "No pending cart found for this user." });
            }

            var invoiceItems = cart.Cartitems.Select(ci => new
            {
                vehicleId = ci.VehicleId,
                vehicleName = ci.Vehicle?.Name, 
                vehicleRegistration = ci.Vehicle?.Registration,
                startDate = ci.StartDate,
                endDate = ci.EndDate,
                dailyRate = ci.DailyRate,
                totalPrice = ci.TotalPrice
            }).ToList();

            return Ok(new { cartItems = invoiceItems });
        }
        private bool CartExists(int id)
        {
            return (_dataContext.Carts?.Any(e => e.CartId == id)).GetValueOrDefault();
        }
    }

}

