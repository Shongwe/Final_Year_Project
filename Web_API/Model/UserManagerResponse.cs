namespace Web_API.Model
{
    public class UserManagerResponse
    {
        public string Message { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public IEnumerable<string>? Errors { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Role  { get; set; }
    }
}
