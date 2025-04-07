namespace CinemaManagement.API.Service.Interface
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
        //Task<string> UploadVideoAsync(IFormFile videoFile);
    }
}
