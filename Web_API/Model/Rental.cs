namespace Web_API.Model
{
    public class Rental
    {
        public int RentalId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int VehicleId { get; set; }
        public DateTime PickUpDate { get; set; }
        public DateTime DropOffDate { get; set; }
        public double TotalCost { get; set; }
        public int MileageAtRental { get; set; }
        public int MileageAtReturn { get; set; }
        public string Fuellevel { get; set; } = string.Empty;
        public string FuelLevelAtReturn { get; set; } = string.Empty;
        public string ConditionCheck { get; set; } = string.Empty;
        public string ConditionCheckAtReturn { get; set; } = string.Empty;
        public string ConditionNotes { get; set; } = string.Empty;
        public string ConditionNotesAtReturn { get; set; } = string.Empty;
        public double DepositAmount { get; set; } 
        public string RentalStatus { get; set; } = string.Empty; 
        public string PickUpLocation { get; set; } = string.Empty; 
        public string DropOffLocation { get; set; } = string.Empty;
        public DateTime? ReturnDate { get; set; }
        public User? Customer { get; set; }
        public Vehicle? Vehicle { get; set; }
        public ICollection<Payment>? Payments { get; set; }= new List<Payment>();

    }
}