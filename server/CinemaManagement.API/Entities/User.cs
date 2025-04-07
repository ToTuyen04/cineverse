using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string? UserEmail { get; set; }

    public string? UserPassword { get; set; }

    public string? UserFirstName { get; set; }

    public string? UserLastName { get; set; }

    public string? UserSearchName { get; set; }

    public string? UserPhoneNumber { get; set; }

    public string? UserAvatar { get; set; }

    public DateOnly? UserDateOfBirth { get; set; }

    public DateTime? UserCreateAt { get; set; }

    public byte? UserGender { get; set; }

    public int? UserPoint { get; set; }

    public byte? UserStatus { get; set; }

    public int? RankId { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Rank? Rank { get; set; }
}
