using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Response
{
    public class ConfigurationResponseDTO
    {
        public string ConfigurationId { get; set; }
        public string ConfigurationName { get; set; }

        public string ConfigurationContent { get; set; }

        public string ConfigurationUnit { get; set; }
        
        public string? ConfigurationDescription { get; set; }

        public string? ConfigurationDefaultContent { get; set; }
    }
}
