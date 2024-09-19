using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting.Internal;
using System;
using System.Drawing;
using Web_API.Data;
using Web_API.Model;
using Web_API.Services;
using Web_API.ViewModel;

namespace Web_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private DataContext _dataContext;
        private IWebHostEnvironment _environment;
        public VehicleController(DataContext dataContext, IWebHostEnvironment environment)
        {
            _dataContext = dataContext;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            if (_dataContext.Vehicles == null)
            {
                return NotFound();
            }
            var vehicles = await _dataContext.Vehicles
                                    .Where(v => v.Deleted != 1) 
                                    .ToListAsync();
            return vehicles;
        }

        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("AvailableVehicles")]
        public async Task<IActionResult> GetAvailableVehicles()
        {
            var availableVehicles = await _dataContext.Vehicles
                                  .Where(v => v.Deleted != 1)  
                                  .Where(v => !v.Rentals
                                  .Any(r => r.PickUpDate <= DateTime.Now && r.DropOffDate >= DateTime.Now)
                                      && !v.MaintenanceRecords.Any(m => m.StartDate <= DateTime.Now && m.EndDate >= DateTime.Now))
                                  .ToListAsync();

            return Ok(availableVehicles);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpGet("UnderMaintenanceVehicles")]
        public async Task<IActionResult> GetUnderMaintenanceVehicles()
        {
            var underMaintenanceVehicles = await _dataContext.Vehicles
                                            .Where(v => v.Deleted != 1) 
                                            .Where(v => v.MaintenanceRecords.Any(m => m.StartDate <= DateTime.Now && m.EndDate >= DateTime.Now))
                                            .ToListAsync();

            return Ok(underMaintenanceVehicles);
        }

        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("RentedVehicles")]
        public async Task<IActionResult> GetRentedVehicles()
        {
              var rentedVehicles = await _dataContext.Vehicles
                                .Where(v => v.Deleted != 1) 
                                .Where(v => v.Rentals.Any(r => r.PickUpDate <= DateTime.Now && r.DropOffDate >= DateTime.Now))
                                .ToListAsync();

            return Ok(rentedVehicles);
        }

        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("{id}")]
        public async Task<ActionResult<Vehicle>> GetVehicle(int id)
        {
            if (_dataContext.Vehicles == null)
            {
                return NotFound();
            }
            var vehicle = await _dataContext.Vehicles.FindAsync(id);


            if (vehicle == null)
            {
                return NotFound();
            }
            if (vehicle.Deleted == 1) { return NotFound(); }

            return vehicle;
        }

        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("registrations")]
        public async Task<ActionResult<Vehicle>> GetVehicleyReg(string registration)
        {
            if (_dataContext.Vehicles == null)
            {
                return NotFound();
            }
            var vehicle = await _dataContext.Vehicles.FirstOrDefaultAsync(v => v.Registration == registration);

            if (vehicle == null)
            {
                return NotFound();
            }
            if (vehicle.Deleted == 1) { return NotFound(); }

            return vehicle;
        }

       [Authorize(Roles = "User,Admin,Manager")]
       [HttpGet("{registration}/image")]
        public async Task<IActionResult> GetVehicleImage(String registration)
        {
            var vehicle = await _dataContext.Vehicles.FirstOrDefaultAsync(v => v.Registration == registration);
            if (vehicle == null || vehicle.CarImage == null)
            {
                return NotFound();
            }
            if (vehicle.Deleted == 1) { return NotFound(); }

            return File(vehicle.CarImage, "image/jpeg"); 
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("{registration}/upload")]
        public async Task<IActionResult> UploadVehicleImage(String registration, [FromForm] ImageUpload file)
        {
            var vehicle = await _dataContext.Vehicles.FirstOrDefaultAsync(v => v.Registration == registration);

            if (vehicle == null)
            {
                return NotFound();
            }
            if (vehicle.Deleted == 1) { return NotFound(); }

            if (file == null || file.Image.Length == 0)
            {
                return BadRequest(new { message = "Invalid file." });
            }

            if (!file.Image.ContentType.StartsWith("image/"))
            {
                return BadRequest(new { message = "Invalid file type. Please upload an image." });
            }

            if (file != null && file.Image.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await file.Image.CopyToAsync(memoryStream);
                    vehicle.CarImage = memoryStream.ToArray();
                }

                _dataContext.Vehicles.Update(vehicle);
                await _dataContext.SaveChangesAsync();
            }

            return Ok(vehicle);
        }

        [Authorize(Roles = "Manager")]
        [HttpPost("{registration}")]
        public async Task<IActionResult> MarkVehicleAsDeleted(string registration)
        {
            if (_dataContext.Vehicles == null)
            {
                return NotFound();
            }

            var vehicle = await _dataContext.Vehicles.FirstOrDefaultAsync(v => v.Registration == registration);

            if (vehicle == null)
            {
                return NotFound();
            }

            vehicle.Deleted = 1;

            _dataContext.Vehicles.Update(vehicle);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Vehicle marked as deleted" });
        }


        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("update/{vehicleIds}")]
        public async Task<IActionResult> Putvehicle(string vehicleReg, Vehicle vehicle)
        {
            if (vehicleReg != vehicle.Registration)
            {
                return BadRequest(new { message="Registration's do not match"});
            }

            _dataContext.Entry(vehicle).State = EntityState.Modified;

            try
            {
                await _dataContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehicleExists(vehicle.VehicleId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<ActionResult<Vehicle>> PostVehicle(Vehicle vehicle)
        {
            if (_dataContext.Vehicles == null)
            {
                return BadRequest(new { message = "Entity set 'dataContext.Vehicles'  is null." });
            }
            _dataContext.Vehicles.Add(vehicle);
            await _dataContext.SaveChangesAsync();

            return CreatedAtAction("GetVehicle", new { id = vehicle.VehicleId }, vehicle);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("AddCar")]
        public async Task<IActionResult> AddCar([FromBody] Vehicle vehicle)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Invalid data", details = ModelState });
            }

            if (await _dataContext.Vehicles.AnyAsync(u => u.Registration == vehicle.Registration && u.Deleted == 0))
            {
                return BadRequest(new { error = "Vehicle already exists." });
            }


            _dataContext.Vehicles.Add(vehicle);
            await _dataContext.SaveChangesAsync();

            return Ok(new { message = "Added successfully." });
        }


        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("search")]
        public async Task<IActionResult> Search(string keyword)
        {
            var query = _dataContext.Vehicles.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(i =>
                    (i.Make.Contains(keyword) ||
                     i.Registration.Contains(keyword) ||
                     i.Model.Contains(keyword) ||
                     i.Category.Contains(keyword) ||
                     i.AdditionalFeatures.Contains(keyword)) &&
                    i.Deleted != 1);
            }

            var items = await query.ToListAsync();
            return Ok(items);
        }


        private bool VehicleExists(int id)
        {
            return (_dataContext.Vehicles?.Any(e => e.VehicleId == id)).GetValueOrDefault();
        }
    }
}
