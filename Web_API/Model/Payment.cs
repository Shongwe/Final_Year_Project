namespace Web_API.Model
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public int RentalId { get; set; }
        public DateTime PaymentDate { get; set; }
        public double AmountPaid { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }

        public Rental Rental { get; set; }
    }
}
