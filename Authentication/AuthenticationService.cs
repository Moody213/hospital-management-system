using HospitalManagementAPI.Data;
using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagementAPI.Authentication
{
    public class AuthenticationService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public AuthenticationService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, 
            JwtTokenService jwtTokenService, RoleManager<IdentityRole> roleManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Admins can only be created by other admins or seeded on startup
            if (string.Equals(request.Role, "Admin", StringComparison.OrdinalIgnoreCase))
                return new AuthResponseDto { Success = false, Message = "Admin accounts cannot be self-registered." };

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                return new AuthResponseDto { Success = false, Message = "User already exists" };

            var user = new ApplicationUser
            {
                Email = request.Email,
                UserName = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return new AuthResponseDto { Success = false, Message = string.Join(", ", result.Errors.Select(e => e.Description)) };

            if (!await _roleManager.RoleExistsAsync(request.Role))
                await _roleManager.CreateAsync(new IdentityRole(request.Role));

            await _userManager.AddToRoleAsync(user, request.Role);

            // Auto-create linked entity record so /me endpoints return valid data
            if (string.Equals(request.Role, "Patient", StringComparison.OrdinalIgnoreCase))
            {
                var patient = new Patient
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Age = 0,
                    Gender = "M",
                    PhoneNumber = "0000000000",
                    Address = "Not set",
                    BloodType = "Unknown",
                    EmergencyContactName = "Not set",
                    EmergencyContactPhone = "0000000000",
                    UserId = user.Id
                };
                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
            }
            else if (string.Equals(request.Role, "Doctor", StringComparison.OrdinalIgnoreCase))
            {
                var doctor = new Doctor
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    LicenseNumber = "PENDING",
                    Specialization = "General",
                    PhoneNumber = "0000000000",
                    YearsOfExperience = 0,
                    IsActive = true,
                    UserId = user.Id
                };
                _context.Doctors.Add(doctor);
                await _context.SaveChangesAsync();
            }

            var tokens = await _jwtTokenService.GenerateTokensAsync(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "User registered successfully",
                Data = tokens
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return new AuthResponseDto { Success = false, Message = "Invalid email or password" };

            var result = await _signInManager.PasswordSignInAsync(user, request.Password, false, false);
            if (!result.Succeeded)
                return new AuthResponseDto { Success = false, Message = "Invalid email or password" };

            // Ensure entity record exists for pre-existing accounts that were created before auto-creation was added
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains("Patient"))
            {
                var exists = await _context.Patients.AnyAsync(p => p.UserId == user.Id);
                if (!exists)
                {
                    _context.Patients.Add(new Patient
                    {
                        FirstName = user.FirstName ?? "Unknown",
                        LastName = user.LastName ?? "Unknown",
                        Email = user.Email!,
                        Age = 0,
                        Gender = "M",
                        PhoneNumber = "0000000000",
                        Address = "Not set",
                        BloodType = "Unknown",
                        EmergencyContactName = "Not set",
                        EmergencyContactPhone = "0000000000",
                        UserId = user.Id
                    });
                    await _context.SaveChangesAsync();
                }
            }
            else if (roles.Contains("Doctor"))
            {
                var exists = await _context.Doctors.AnyAsync(d => d.UserId == user.Id);
                if (!exists)
                {
                    _context.Doctors.Add(new Doctor
                    {
                        FirstName = user.FirstName ?? "Unknown",
                        LastName = user.LastName ?? "Unknown",
                        Email = user.Email!,
                        LicenseNumber = "PENDING",
                        Specialization = "General",
                        PhoneNumber = "0000000000",
                        YearsOfExperience = 0,
                        IsActive = true,
                        UserId = user.Id
                    });
                    await _context.SaveChangesAsync();
                }
            }

            var tokens = await _jwtTokenService.GenerateTokensAsync(user);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Data = tokens
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                var tokens = await _jwtTokenService.RefreshAccessTokenAsync(refreshToken);
                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Token refreshed successfully",
                    Data = tokens
                };
            }
            catch
            {
                return new AuthResponseDto { Success = false, Message = "Invalid refresh token" };
            }
        }

        public async Task LogoutAsync(string refreshToken)
        {
            await _jwtTokenService.RevokeRefreshTokenAsync(refreshToken);
        }
    }
}
