using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class ScreenType
{
    public int ScreenTypeId { get; set; }

    public string? ScreenTypeName { get; set; }

    public decimal? ScreenPrice { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
