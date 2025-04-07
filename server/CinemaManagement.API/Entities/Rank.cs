using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Rank
{
    public int RankId { get; set; }

    public string? RankName { get; set; }

    public int? RankMilestone { get; set; }

    public double? RankDiscount { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
