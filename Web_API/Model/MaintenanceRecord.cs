using System.ComponentModel.DataAnnotations;

namespace Web_API.Model
{
    public class MaintenanceRecord
    {
        [Key]
        public int MaintenanceId { get; set; }
        public int VehicleId { get; set; }
        public string Description { get; set; } = string.Empty;
        public double Cost { get; set; }
        public Vehicle Vehicle { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
