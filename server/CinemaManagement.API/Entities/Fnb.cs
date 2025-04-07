using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Fnb
{
    public int FnbId { get; set; }

    public string? FnbName { get; set; }

    public string? FnbType { get; set; }

    public decimal? FnbListPrice { get; set; }

    public bool? FnbAvailable { get; set; }

    public string? FnbSearchName { get; set; }

    public virtual ICollection<ComboDetail> ComboDetails { get; set; } = new List<ComboDetail>();
}
