using HospitalManagementAPI.DTOs;
using HospitalManagementAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace HospitalManagementAPI.Authentication
{
    public class AuthenticationService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthenticationService(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, 
            JwtTokenService jwtTokenService, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
            _roleManager = roleManager;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
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
