using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Web_API.Model;
using Web_API.ViewModel;

namespace Web_API.Services
{
    public interface IUserService
    {
        Task<UserManagerResponse> RegisterUserAsync(RegisterViewModel model);
        Task<UserManagerResponse> LogInUserAsync(LoginViewModel model);
        Task<UserManagerResponse> ChangeUserRoleAsync(string userEmail, string newRole);

    }

    public class UserService: IUserService
    {
        private UserManager<User> _userManager;
        private IConfiguration _configuration;

        public UserService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<UserManagerResponse> RegisterUserAsync(RegisterViewModel model)
        {
            if(model == null)
                throw new NullReferenceException("Register Model is Null");

            if(model.Password != model.ConfirmPassword)
            {
                return new UserManagerResponse { 
                    Message = "Passwords do not match",
                    IsSuccess = false,
                };
            }
              
            var identityUser = new User
            {
                Firstname = model.Firstname,
                Lastname = model.Lastname,
                PhoneNumber=model.PhoneNumber,
                Email = model.Email,
                UserName = model.Email,
                Address = model.Address,
                LicenseInfo = model.LicenseInfo,
            };

            var result = await _userManager.CreateAsync(identityUser,model.Password);

            if(result.Succeeded) {
                return new UserManagerResponse
                {
                    Message = "User created successfully",
                    IsSuccess = true,
                };

            }

            return new UserManagerResponse
            {
                Message = "User creation failed",
                IsSuccess = false,
                Errors = result.Errors.Select(e => e.Description)
            };
        }

        public async Task<UserManagerResponse> LogInUserAsync(LoginViewModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if(user == null)
            {
                return new UserManagerResponse
                {
                    Message = "There is no user with that email address",
                    IsSuccess = false,
                };
            }

            var result = await _userManager.CheckPasswordAsync(user, model.Password);

            if(!result)
            {
                return new UserManagerResponse { 
                    Message = "Incorrect password",
                    IsSuccess = false,
                };
            }
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            }
            .Union(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var preKey = _configuration["AuthSettings:Key"];
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(preKey));

            var token = new JwtSecurityToken(
               issuer: _configuration["AuthSettings:Issuer"],
               audience: _configuration["AuthSettings:Audience"],
               claims: claims,
               expires: DateTime.Now.AddDays(30),
               signingCredentials: new SigningCredentials(key,SecurityAlgorithms.HmacSha256)
                );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            if(tokenString != null)
                return new UserManagerResponse
                {
                    Message = tokenString,
                    IsSuccess = true,
                    ExpiryDate = token.ValidTo,
                    Role = roles.FirstOrDefault()
                };

            return new UserManagerResponse
            {
                Message = tokenString,
                IsSuccess = true,
                ExpiryDate = token.ValidTo,
                Role = roles.FirstOrDefault()
            };

        }

        public async Task<UserManagerResponse> ChangeUserRoleAsync(string userEmail, string newRole)
        {
            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return new UserManagerResponse
                {
                    Message = "User not found",
                    IsSuccess = false,
                };
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (!removeResult.Succeeded)
            {
                return new UserManagerResponse
                {
                    Message = "Failed to remove user from existing roles",
                    IsSuccess = false,
                    Errors = removeResult.Errors.Select(e => e.Description)
                };
            }

            var addResult = await _userManager.AddToRoleAsync(user, newRole);

            if (!addResult.Succeeded)
            {
                return new UserManagerResponse
                {
                    Message = "Failed to add user to the new role",
                    IsSuccess = false,
                    Errors = addResult.Errors.Select(e => e.Description)
                };
            }

            return new UserManagerResponse
            {
                Message = "User role updated successfully",
                IsSuccess = true,
            };
        }



    }
}
