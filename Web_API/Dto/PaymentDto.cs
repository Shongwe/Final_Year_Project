namespace Web_API.Dto
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int RentalId { get; set; }
        public DateTime? PaymentDate { get; set; }
        public double AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
    }
}
