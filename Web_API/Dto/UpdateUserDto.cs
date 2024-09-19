namespace Web_API.Dto
{
    public class UpdateUserDto
    {
        public string Firstname { get; set; } = string.Empty;
        public string Lastname { get; set; } = string.Empty;
        public String Address { get; set; } = string.Empty;
        public String LicenseInfo { get; set; } = string.Empty;
        public String Email { get; set; }= string.Empty;
        public String PhoneNumber { get; set; } = string.Empty;
        public String UserName { get; set; } = string.Empty;
    }
}
