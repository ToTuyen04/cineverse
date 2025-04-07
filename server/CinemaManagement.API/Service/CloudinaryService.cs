using CinemaManagement.API.Service.Interface;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;

namespace CinemaManagement.API.Service
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(Cloudinary cloudinary, ILogger<CloudinaryService> logger)
        {
            _cloudinary = cloudinary;
            _logger = logger;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            try
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Transformation = new Transformation().Width(1000).Height(1000).Crop("limit"),
                    Folder = "cinema-management"
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
                    throw new Exception(uploadResult.Error.Message);
                }

                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to Cloudinary");
                throw new Exception("An error occurred while uploading the image", ex);
            }
        }
        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return false;

            try
            {
                var deleteParams = new DeletionParams(publicId);
                var result = await _cloudinary.DestroyAsync(deleteParams);

                return result.Result == "ok";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting image {publicId} from Cloudinary");
                throw new Exception($"An error occurred while deleting the image {publicId}", ex);
            }
        }
        //public async Task<string> UploadVideoAsync(IFormFile videoFile)
        //{
        //    if (videoFile == null || videoFile.Length == 0)
        //        return null;

        //    try
        //    {
        //        using var stream = videoFile.OpenReadStream();
        //        var uploadParams = new VideoUploadParams()
        //        {
        //            File = new FileDescription(videoFile.FileName, stream),
        //            Folder = "movie_trailers"
        //        };

        //        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        //        if (uploadResult.Error != null)
        //        {
        //            _logger.LogError($"Cloudinary upload error: {uploadResult.Error.Message}");
        //            throw new Exception(uploadResult.Error.Message);
        //        }

        //        return uploadResult.SecureUrl.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error uploading video to Cloudinary");
        //        throw new Exception("An error occurred while uploading the video", ex);
        //    }
        //}
    }
}
