using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class ChairType
{
    public int ChairTypeId { get; set; }

    public string? ChairTypeName { get; set; }

    public decimal? ChairPrice { get; set; }

    public virtual ICollection<Chair> Chairs { get; set; } = new List<Chair>();
}
