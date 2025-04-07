using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Configuration
{
    public int ConfigurationId { get; set; }

    public string? ConfigurationName { get; set; }

    public string? ConfigurationContent { get; set; }

    public string? ConfigurationUnit { get; set; }

    public string? ConfigurationDescription { get; set; }

    public string? ConfigurationDefaultContent { get; set; }
}
