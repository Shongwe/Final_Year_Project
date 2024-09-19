using System.ComponentModel.DataAnnotations;

namespace Web_API.ViewModel
{
    public class RegisterViewModel
    {
        [Required]
        [StringLength(50)]
        public string Firstname { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Lastname { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LicenseInfo { get; set; } = string.Empty;



        [Required]
        [StringLength(100)]
        public string Address { get; set; } = string.Empty;


        [Required]
        [StringLength(50)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength=5)]
        public string Password { get; set; }= string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 5)]
        public string ConfirmPassword { get; set; }= string.Empty;
    }
}
