﻿using Microsoft.AspNetCore.Http;
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
        [HttpGet("pending-carts")]
        public async Task<IActionResult> GetPendingCarts()
        {
            var pendingCarts = await _dataContext.Carts
                .Include(c => c.Cartitems)
                .Where(c => c.Status == "Pending")
                .ToListAsync();

            if (pendingCarts == null || pendingCarts.Count == 0)
            {
                return NotFound(new { message = "No pending carts found." });
            }

            var cartDtos = pendingCarts.Select(cart => new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedDate = cart.CreatedDate,
                Status = cart.Status,
                CheckoutDate = cart.CheckoutDate,
                AdminUserId = cart.AdminUserId,
                CartItems = cart.Cartitems?.Select(item => new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    CartId = item.CartId,
                    UserId = item.UserId,
                    VehicleId = item.VehicleId,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    TotalPrice = item.TotalPrice,
                    DailyRate = item.DailyRate,
                    PickUpLocation = item.pickUpLocation,
                    DropOffLocation = item.dropOffLocation,
                    Status = item.Status
                }).ToList() ?? new List<CartItemDto>()
            }).ToList();

            return Ok(cartDtos);
        }
        [HttpGet("checked-out-carts")]
        public async Task<IActionResult> GetCheckedOutCarts()
        {
            var pendingCarts = await _dataContext.Carts
                .Include(c => c.Cartitems)
                .Where(c => c.Status == "Checked out")
                .ToListAsync();

            if (pendingCarts == null || pendingCarts.Count == 0)
            {
                return NotFound(new { message = "No Checked out carts found." });
            }

            var cartDtos = pendingCarts.Select(cart => new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedDate = cart.CreatedDate,
                Status = cart.Status,
                CheckoutDate = cart.CheckoutDate,
                AdminUserId = cart.AdminUserId,
                CartItems = cart.Cartitems?.Select(item => new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    CartId = item.CartId,
                    UserId = item.UserId,
                    VehicleId = item.VehicleId,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    TotalPrice = item.TotalPrice,
                    DailyRate = item.DailyRate,
                    PickUpLocation = item.pickUpLocation,
                    DropOffLocation = item.dropOffLocation,
                    Status = item.Status
                }).ToList() ?? new List<CartItemDto>()
            }).ToList();

            return Ok(cartDtos);
        }

        [HttpGet("checked-in-carts")]
        public async Task<IActionResult> GetCheckedInCarts()
        {
            var pendingCarts = await _dataContext.Carts
                .Include(c => c.Cartitems)
                .Where(c => c.Status == "Checked in")
                .ToListAsync();

            if (pendingCarts == null || pendingCarts.Count == 0)
            {
                return NotFound(new { message = "No Checked in carts found." });
            }

            var cartDtos = pendingCarts.Select(cart => new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedDate = cart.CreatedDate,
                Status = cart.Status,
                CheckoutDate = cart.CheckoutDate,
                AdminUserId = cart.AdminUserId,
                CartItems = cart.Cartitems?.Select(item => new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    CartId = item.CartId,
                    UserId = item.UserId,
                    VehicleId = item.VehicleId,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    TotalPrice = item.TotalPrice,
                    DailyRate = item.DailyRate,
                    PickUpLocation = item.pickUpLocation,
                    DropOffLocation = item.dropOffLocation,
                    Status = item.Status
                }).ToList() ?? new List<CartItemDto>()
            }).ToList();

            return Ok(cartDtos);
        }

        [HttpGet("closed-carts")]
        public async Task<IActionResult> GetClosedCarts()
        {
            var pendingCarts = await _dataContext.Carts
                .Include(c => c.Cartitems)
                .Where(c => c.Status == "Closed")
                .ToListAsync();

            if (pendingCarts == null || pendingCarts.Count == 0)
            {
                return NotFound(new { message = "No Closed carts found." });
            }

            var cartDtos = pendingCarts.Select(cart => new CartDto
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                CreatedDate = cart.CreatedDate,
                Status = cart.Status,
                CheckoutDate = cart.CheckoutDate,
                AdminUserId = cart.AdminUserId,
                CartItems = cart.Cartitems?.Select(item => new CartItemDto
                {
                    CartItemId = item.CartItemId,
                    CartId = item.CartId,
                    UserId = item.UserId,
                    VehicleId = item.VehicleId,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    TotalPrice = item.TotalPrice,
                    DailyRate = item.DailyRate,
                    PickUpLocation = item.pickUpLocation,
                    DropOffLocation = item.dropOffLocation,
                    Status = item.Status
                }).ToList() ?? new List<CartItemDto>()
            }).ToList();

            return Ok(cartDtos);
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
        public async Task<IActionResult> AddCartItem(string userId, int vehicleId, double dailyRate, DateTime startDate, DateTime endDate,string pickup, string dropOff)
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
                    UserId = userId,
                    DailyRate = dailyRate,
                    StartDate = startDate,
                    EndDate = endDate,
                    pickUpLocation = pickup,
                    dropOffLocation= dropOff,
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

        [HttpPost("items/{itemId}/checkout")]
        public async Task<IActionResult> CheckoutCartItem(int itemId)
        {
            var cartItem = await _dataContext.CartItems
                .FirstOrDefaultAsync(c => c.CartItemId == itemId && c.Deleted == 0);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            cartItem.Status = "Checked Out"; 

            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart item checked out successfully.", cartItem });
        }
        [HttpPost("items/{itemId}/checkedin")]
        public async Task<IActionResult> CheckInCartItem(int itemId, [FromBody] CheckInDto checkInData)
        {
            var cartItem = await _dataContext.CartItems
                .FirstOrDefaultAsync(c => c.CartItemId == itemId && c.Deleted == 0);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            cartItem.Status = "Checked in";

            var vehicle = await _dataContext.Vehicles.FindAsync(cartItem.VehicleId);

            if (vehicle == null)
                return NotFound("Vehicle not found.");

            var rental = await _dataContext.Rentals
              .Where(r => r.VehicleId == checkInData.VehicleId
                       && r.PickUpDate == checkInData.PickUpDate
                       && r.DropOffDate == checkInData.DropOffDate
                       && r.RentalStatus == "Checked Out")
              .FirstOrDefaultAsync();

            if (rental == null)
                return BadRequest("No active rental found for this vehicle.");

            rental.RentalStatus = "Checked In";
            rental.MileageAtReturn = checkInData.MileageAtReturn;
            rental.FuelLevelAtReturn = checkInData.FuelLevelAtReturn;
            rental.ConditionNotesAtReturn = checkInData.ConditionNotesAtReturn;
            rental.ReturnDate = DateTime.Now;

            _dataContext.Rentals.Update(rental);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart item checked in successfully.", cartItem });
        }

        [HttpPost("api/Vehicle/{id}/checkin")]
        public async Task<IActionResult> CheckInRental(int id, [FromBody] CheckInDto checkInData)
        {
            var vehicle = await _dataContext.Vehicles.FindAsync(id);
            if (vehicle == null)
                return NotFound("Vehicle not found.");

            var rental = await _dataContext.Rentals
              .Where(r => r.VehicleId == checkInData.VehicleId
                       && r.PickUpDate == checkInData.PickUpDate
                       && r.DropOffDate == checkInData.DropOffDate
                       && r.RentalStatus == "Checked Out")
              .FirstOrDefaultAsync();

            if (rental == null)
                return BadRequest("No active rental found for this vehicle.");

            rental.RentalStatus = "Checked In";
            rental.MileageAtReturn = checkInData.MileageAtReturn;
            rental.FuelLevelAtReturn = checkInData.FuelLevelAtReturn;
            rental.ConditionNotesAtReturn = checkInData.ConditionNotesAtReturn;
            rental.ReturnDate = DateTime.Now;

            _dataContext.Rentals.Update(rental);
            await _dataContext.SaveChangesAsync();

            return Ok("Vehicle checked in successfully.");
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
            cart.CheckoutDate = DateTime.Now;

            _dataContext.Carts.Update(cart);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Cart status updated to Pending." });
        }
        [HttpPost("{cartId}/check-out-cart")]
        public async Task<IActionResult> CheckOutCart(int cartId)
        {
            var cart = await _dataContext.Carts
                                         .Include(c => c.Cartitems) 
                                         .FirstOrDefaultAsync(c => c.CartId == cartId && c.Status == "Pending");

            if (cart == null)
            {
                return NotFound(new { message = "No pending cart found with this ID." });
            }

            if (cart.Cartitems != null)
            {
                var allItemsCheckedOut = cart.Cartitems.All(item => item.Status == "Checked Out");

                if (!allItemsCheckedOut)
                {
                    return BadRequest(new { message = "Not all cart items are checked out. Please ensure all items are checked out before checking out the cart." });
                }
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
         
            var carts = await _dataContext.Carts
                               .Include(c => c.Cartitems)
                               .ThenInclude(ci => ci.Vehicle)
                               .Where(c => c.UserId == userId && c.Status == "Pending")
                               .OrderByDescending(c => c.CreatedDate)
                               .ToListAsync();

            if (carts == null || carts.Count == 0)
            {
                return NotFound(new { message = "No pending cart found for this user." });
            }

            var invoiceItems = carts.Select(cart => new
            {
                cartId = cart.CartId,
                status=cart.Status,
                createdDate=cart.CreatedDate,
                userId =cart.UserId,
                cartItems = cart.Cartitems.Select(ci => new
                {
                    vehicleId = ci.VehicleId,
                    vehicleName = ci.Vehicle?.Name,
                    vehicleRegistration = ci.Vehicle?.Registration,
                    startDate = ci.StartDate,
                    endDate = ci.EndDate,
                    dailyRate = ci.DailyRate,
                    totalPrice = ci.TotalPrice
                }).ToList()
            }).ToList();

            return Ok(new { cartItems = invoiceItems });
        }
        [HttpGet("{userId}/carts")]
        public async Task<IActionResult> GetCarts(string userId)
        {
            var validStatuses = new[] { "Open", "Pending", "Checked Out","Checked in", "Closed" };


            var carts = await _dataContext.Carts
                               .Include(c => c.Cartitems)
                               .ThenInclude(ci => ci.Vehicle)
                               .Where(c => c.UserId == userId && validStatuses.Contains(c.Status))
                               .OrderByDescending(c => c.CreatedDate)
                               .ToListAsync();

            if (carts == null || carts.Count == 0)
            {
                return NotFound(new { message = "No pending cart found for this user." });
            }

            var invoiceItems = carts.Select(cart => new
            {
                cartId = cart.CartId,
                status = cart.Status,
                createdDate = cart.CreatedDate,
                userId = cart.UserId,
                cartItems = cart.Cartitems.Select(ci => new
                {
                    vehicleId = ci.VehicleId,
                    vehicleName = ci.Vehicle?.Name,
                    vehicleRegistration = ci.Vehicle?.Registration,
                    startDate = ci.StartDate,
                    endDate = ci.EndDate,
                    dailyRate = ci.DailyRate,
                    totalPrice = ci.TotalPrice
                }).ToList()
            }).ToList();

            return Ok(new { cartItems = invoiceItems });
        }


        [HttpPost("payment/{rentalId}/")]
        public async Task<IActionResult> MakePayment(int rentalId, [FromBody] PaymentDto paymentDto)
        {
            var rental = await _dataContext.Rentals.Include(r => r.Payments)
                            .FirstOrDefaultAsync(r => r.RentalId == rentalId);

            if (rental == null)
                return NotFound("Rental not found.");

            if (paymentDto.AmountPaid != rental.TotalCost)
                return BadRequest("Payment amount does not match the rental total.");

            var payment = new Payment
            {
                RentalId = rentalId,
                AmountPaid = paymentDto.AmountPaid,
                PaymentMethod = paymentDto.PaymentMethod,
                PaymentStatus = "Completed",
                PaymentDate = DateTime.Now
            };

            rental.Payments.Add(payment);
            rental.RentalStatus = "Paid"; 

            _dataContext.Payments.Add(payment);
            await _dataContext.SaveChangesAsync();

            return Ok("Payment made successfully.");
        }

        private bool CartExists(int id)
        {
            return (_dataContext.Carts?.Any(e => e.CartId == id)).GetValueOrDefault();
        }
    }

}

