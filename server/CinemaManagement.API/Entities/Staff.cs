using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Staff
{
    public int StaffId { get; set; }

    public string? StaffEmail { get; set; }

    public string? StaffPassword { get; set; }

    public string? StaffAvatar { get; set; }

    public string? StaffFirstName { get; set; }

    public string? StaffLastName { get; set; }

    public string? StaffSearchName { get; set; }

    public string? StaffPhoneNumber { get; set; }

    public DateOnly? StaffDateOfBirth { get; set; }

    public DateTime? StaffCreateAt { get; set; }

    public byte? StaffGender { get; set; }

    public int? StaffRoleId { get; set; }

    public byte? StaffStatus { get; set; }

    public int? StaffTheaterId { get; set; }

    public virtual ICollection<Combo> Combos { get; set; } = new List<Combo>();

    public virtual ICollection<Movie> MovieMovieCreatedByNavigations { get; set; } = new List<Movie>();

    public virtual ICollection<Movie> MovieMovieUpdateByNavigations { get; set; } = new List<Movie>();

    public virtual Role? StaffRole { get; set; }

    public virtual Theater? StaffTheater { get; set; }
}
