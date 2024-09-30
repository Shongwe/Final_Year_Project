namespace Web_API.Dto
{
    public class CheckInDto
    {
        public int VehicleId { get; set; }
        public int MileageAtReturn { get; set; }
        public string FuelLevelAtReturn { get; set; } = string.Empty;
        public string ConditionAtReturn { get; set; } = string.Empty;
        public string ConditionNotesAtReturn { get; set; } = string.Empty;
        public DateTime? PickUpDate { get; set; }
        public DateTime? DropOffDate { get; set; }
    }
}
