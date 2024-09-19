using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing;
using Web_API.Data;
using Web_API.Model;
using Web_API.Services;
using Web_API.ViewModel;

namespace Web_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RentalController : ControllerBase
    {
        private DataContext _dataContext;
        public RentalController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentals()
        {
            if (_dataContext.Rentals == null)
            {
                return NotFound();
            }
            return await _dataContext.Rentals.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Rental>> PostRental(Rental rental)
        {
            if (_dataContext.Rentals == null)
            {
                return Problem("Entity set 'dataContext.Rentals'  is null.");
            }
            _dataContext.Rentals.Add(rental);
            await _dataContext.SaveChangesAsync();

            return CreatedAtAction("GetRental", new { id = rental.RentalId }, rental);
        }

        [HttpGet("CarsRented")]
        public async Task<IActionResult> GetCarsRented()
        {
            var carsRented = await _dataContext.Rentals
                .Include(r => r.Vehicle)
                .Include(r => r.Customer)
                .Select(r => new
                {
                    r.RentalId,
                    Vehicle = r.Vehicle.Make + " " + r.Vehicle.Model,
                    r.Customer.UserName,
                    r.PickUpDate,
                    r.DropOffDate,
                    r.TotalCost
                })
                .ToListAsync();

            return Ok(carsRented);
        }

        [HttpGet("OverdueReturns")]
        public async Task<IActionResult> GetOverdueReturns()
        {
            var overdueReturns = await _dataContext.Rentals
                .Include(r => r.Vehicle)
                .Include(r => r.Customer)
                .Where(r => r.DropOffDate < DateTime.Now && !r.Payments.Any(p => p.PaymentStatus == "Completed"))
                .Select(r => new
                {
                    r.RentalId,
                    Vehicle = r.Vehicle.Make + " " + r.Vehicle.Model,
                    r.Customer.UserName,
                    r.DropOffDate,
                    r.TotalCost
                })
                .ToListAsync();

            return Ok(overdueReturns);
        }

        [HttpGet("FrequentRenters")]
        public async Task<IActionResult> GetFrequentRenters()
        {
            var frequentRenters = await _dataContext.Rentals
                .GroupBy(r => r.Customer.UserName)
                .Select(g => new
                {
                    Customer = g.Key,
                    RentalsCount = g.Count(),
                    TotalSpent = g.Sum(r => r.TotalCost)
                })
                .OrderByDescending(g => g.RentalsCount)
                .ToListAsync();

            return Ok(frequentRenters);
        }


        [HttpGet("RentalTrends")]
        public async Task<IActionResult> GetRentalTrends([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            startDate ??= DateTime.Now.AddMonths(-12); 
            endDate ??= DateTime.Now;

            var rentalTrends = await _dataContext.Rentals
                .Where(r => r.PickUpDate >= startDate && r.PickUpDate <= endDate)
                .GroupBy(r => new { Year = r.PickUpDate.Year, Month = r.PickUpDate.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    RentalCount = g.Count()
                })
                .OrderBy(rt => rt.Year)
                .ThenBy(rt => rt.Month)
                .ToListAsync();

            return Ok(rentalTrends);
        }

        [HttpGet("UnfulfilledReservations")]
        public async Task<IActionResult> GetUnfulfilledReservations()
        {
            var unfulfilledReservationsCount = await _dataContext.Reservations
                .Where(reservation => !_dataContext.Rentals
                    .Any(rental => rental.VehicleId == reservation.VehicleId &&
                                   rental.PickUpDate == reservation.PickUpDate))
                .CountAsync();

            return Ok(new { UnfulfilledReservations = unfulfilledReservationsCount });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRental(int id)
        {
            var rental = await _dataContext.Rentals.FindAsync(id);
            if (rental == null)
            {
                return NotFound();
            }

            _dataContext.Rentals.Remove(rental);
            await _dataContext.SaveChangesAsync();

            return NoContent();
        }
    }
}