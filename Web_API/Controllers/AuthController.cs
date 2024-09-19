using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using System;
using System.Net;
using System.Security;
using Web_API.Data;
using Web_API.Dto;
using Web_API.Model;
using Web_API.Services;
using Web_API.ViewModel;

namespace Web_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private IUserService _userService;
        private UserManager<User> _userManager;
        private IServiceProvider _serviceProvider;
        private DataContext _dataContext;



        public AuthController(IUserService userService, UserManager<User> userManager, IServiceProvider serviceProvider, DataContext dataContext)
        {
            _userService = userService;
            _userManager = userManager;
            _serviceProvider = serviceProvider;
            _dataContext = dataContext;
        }
       


        [HttpPost("Login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _userService.LogInUserAsync(model);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return BadRequest(result);
            }
            return BadRequest(new { message = "Some properties are not valid" });

        }

        [HttpPost("Register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Some properties are not valid" });
            }

            var result = await _userService.RegisterUserAsync(model);

            if (result.IsSuccess)
            {
                var newUser = await _userManager.FindByEmailAsync(model.Email);
                if (newUser == null)
                {
                    return BadRequest(new { message = "User not found after registration." });
                }

                var _roleManager = _serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

                if (!await _roleManager.RoleExistsAsync("User"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("User"));
                }

                var roleResult = await _userManager.AddToRoleAsync(newUser, "User");

                if (!roleResult.Succeeded)
                {
                    return BadRequest(new { message = "Failed to assign role." });
                }

                return Ok(result);
            }

            return BadRequest(result);
        }


        [Authorize(Roles = "User,Admin,Manager")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "User ID cannot be null or empty." });
            }

            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(user);
        }



        [Authorize(Roles = "User,Admin,Manager")]
        [HttpPost("user/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto model)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { message = "User ID cannot be null or empty." });
            }

            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.Firstname = model.Firstname;
            user.Lastname = model.Lastname;
            user.PhoneNumber = model.PhoneNumber;
            user.Email = model.Email;
            user.Address = model.Address;
            user.LicenseInfo = model.LicenseInfo;
            user.UserName = model.UserName;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message= "User updated successfully."});
            }

            return BadRequest(result.Errors);
        }



        [Authorize(Roles = "Manager")]
        [HttpPost("ChangeUserRole")]
        public async Task<IActionResult> ChangeUserRoleAsync([FromBody] ChangeUserRoleViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Some properties are not valid" });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }
            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (!removeResult.Succeeded)
            {
                return BadRequest(new { message = "Failed to remove user roles" });
            }

            Web_API.Model.User newUser;
            switch (model.NewRole)
            {
                case "Admin":
                    newUser = new User
                    {
                        Id = user.Id,
                        Firstname = user.Firstname,
                        Lastname = user.Lastname,
                        Address = user.Address,
                        LicenseInfo = user.LicenseInfo,
                        UserName = user.UserName,
                        NormalizedUserName = user.NormalizedUserName,
                        Email = user.Email,
                        NormalizedEmail = user.NormalizedEmail,
                        EmailConfirmed = user.EmailConfirmed,
                        PasswordHash = user.PasswordHash,
                        SecurityStamp = user.NormalizedUserName,
                        ConcurrencyStamp = user.ConcurrencyStamp,
                        PhoneNumber = user.PhoneNumber,
                        PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                        TwoFactorEnabled = user.TwoFactorEnabled,
                        LockoutEnd = user.LockoutEnd,
                        LockoutEnabled = user.LockoutEnabled,
                        AccessFailedCount = user.AccessFailedCount
                    };
                    break;

                case "Manager":
                    newUser = new User
                    {
                        Id = user.Id,
                        Firstname = user.Firstname,
                        Lastname = user.Lastname,
                        Address = user.Address,
                        LicenseInfo = user.LicenseInfo,
                        UserName = user.UserName,
                        NormalizedUserName = user.NormalizedUserName,
                        Email = user.Email,
                        NormalizedEmail = user.NormalizedEmail,
                        EmailConfirmed = user.EmailConfirmed,
                        PasswordHash = user.PasswordHash,
                        SecurityStamp = user.NormalizedUserName,
                        ConcurrencyStamp = user.ConcurrencyStamp,
                        PhoneNumber = user.PhoneNumber,
                        PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                        TwoFactorEnabled = user.TwoFactorEnabled,
                        LockoutEnd = user.LockoutEnd,
                        LockoutEnabled = user.LockoutEnabled,
                        AccessFailedCount = user.AccessFailedCount
                    };
                    break;

                case "User":
                    newUser = new Web_API.Model.User
                    {
                        Id = user.Id,
                        Firstname = user.Firstname,
                        Lastname = user.Lastname,
                        Address = user.Address,
                        LicenseInfo = user.LicenseInfo,
                        UserName = user.UserName,
                        NormalizedUserName = user.NormalizedUserName,
                        Email = user.Email,
                        NormalizedEmail = user.NormalizedEmail,
                        EmailConfirmed = user.EmailConfirmed,
                        PasswordHash = user.PasswordHash,
                        SecurityStamp = user.NormalizedUserName,
                        ConcurrencyStamp = user.ConcurrencyStamp,
                        PhoneNumber = user.PhoneNumber,
                        PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                        TwoFactorEnabled = user.TwoFactorEnabled,
                        LockoutEnd = user.LockoutEnd,
                        LockoutEnabled = user.LockoutEnabled,
                        AccessFailedCount = user.AccessFailedCount
                    };
                    break;

                default:
                    return BadRequest(new { message = "Invalid role" });
            }

            if (user == null)
            {
                return BadRequest(new { message = "User not found" });
            }
            var result = await _userManager.DeleteAsync(user);

            await _dataContext.SaveChangesAsync();

            var results = await _userManager.CreateAsync(newUser);
            var roleResult = await _userManager.AddToRoleAsync(newUser, model.NewRole);

            await _dataContext.SaveChangesAsync();


            if (!roleResult.Succeeded)
            {
                return BadRequest(new { message = "Failed to add the new role" });
            }

            if (roleResult.Succeeded)
            {
                return Ok(roleResult);
            }
            return BadRequest(roleResult);
        }

    }
       
    
}
