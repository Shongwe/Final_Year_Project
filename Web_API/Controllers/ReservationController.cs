using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web_API.Data;
using Web_API.Dto;
using Web_API.Model;

namespace CarRentalShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private DataContext _dataContext;
        public ReservationController(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        // POST: api/Reservation
        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation([FromBody] CreateReservationDto reservationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var vehicle = await _dataContext.Vehicles.FindAsync(reservationDto.VehicleId);
            if (vehicle == null)
            {
                return BadRequest("The selected vehicle is not available.");
            }

            bool isReserved = await _dataContext.Reservations.AnyAsync(r =>
                r.VehicleId == reservationDto.VehicleId &&
                r.ReservationStatus == "Confirmed" &&
                (reservationDto.PickUpDate < r.ReturnDate && reservationDto.ReturnDate > r.PickUpDate)
            );

            if (isReserved)
            {
                return BadRequest("The vehicle is already reserved for the selected dates.");
            }

            var reservation = new Reservation
            {
                UserId = reservationDto.UserId,
                VehicleId = reservationDto.VehicleId,
                ReservationDate = DateTime.Now,
                PickUpDate = reservationDto.PickUpDate,
                ReturnDate = reservationDto.ReturnDate,
                ReservationStatus = "Confirmed"
            };

            _dataContext.Reservations.Add(reservation);
            await _dataContext.SaveChangesAsync();

         
            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.ReservationId }, reservation);
        }

        // GET: api/Reservation/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await _dataContext.Reservations
                .Include(r => r.Vehicle)
                .Include(r => r.Customer)
                .FirstOrDefaultAsync(r => r.ReservationId == id);

            if (reservation == null)
            {
                return NotFound();
            }

            return Ok(reservation);
        }

        // PUT: api/Reservation/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] CreateReservationDto reservationDto)
        {
            if (id <= 0 || !ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var reservation = await _dataContext.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            reservation.PickUpDate = reservationDto.PickUpDate;
            reservation.ReturnDate = reservationDto.ReturnDate;


            await _dataContext.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Reservation/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _dataContext.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            _dataContext.Reservations.Remove(reservation);
            await _dataContext.SaveChangesAsync();

       

            return NoContent();
        }
    }
}
