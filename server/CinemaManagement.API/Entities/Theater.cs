using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Theater
{
    public int TheaterId { get; set; }

    public string? TheaterName { get; set; }

    public string? TheaterLocation { get; set; }

    public string? TheaterHotline { get; set; }

    public string? TheaterSearchName { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();
}
