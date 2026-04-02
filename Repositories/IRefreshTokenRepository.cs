using HospitalManagementAPI.Models;

namespace HospitalManagementAPI.Repositories
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken> GetValidTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        Task RevokeUserTokensAsync(string userId);
    }
}
