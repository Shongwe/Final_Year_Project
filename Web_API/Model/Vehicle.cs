namespace Web_API.Model
{
    public class Vehicle
    {
        public int VehicleId { get; set; }
        public String Name { get; set; }= string.Empty;
        public string Registration { get; set; }= string.Empty;
        public String Make { get; set; } = string.Empty;
        public String Model { get; set; } = string.Empty;
        public String Category { get; set; } = string.Empty;
        public String Colors { get; set; } = string.Empty;
        public int NumberOfSeats { get; set; }
        public int Mileage { get; set; }
        public int Year { get; set; }
        public String AdditionalFeatures { get; set; } = string.Empty;
        public byte[]? CarImage { get; set; }
        public double DailyRate { get; set; }
        public String description { get; set; } = string.Empty;
        public int Deleted { get; set; }=0;


        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
        public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
        public ICollection<VehicleStat> VehicleStats { get; set; } = new List<VehicleStat>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public ICollection<AvailabilityPeriod> AvailabilityPeriods { get; set; } = new List<AvailabilityPeriod>();


    }
}
