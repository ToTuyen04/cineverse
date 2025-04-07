using System;
using System.Collections.Generic;

namespace CinemaManagement.API.Entities;

public partial class Combo
{
    public int ComboId { get; set; }

    public string? ComboName { get; set; }

    public string? ComboImage { get; set; }

    public string? ComboType { get; set; }

    public DateTime? ComboCreateAt { get; set; }

    public int? ComboCreateBy { get; set; }

    public string? ComboDescription { get; set; }

    public double? ComboDiscount { get; set; }

    public bool? ComboAvailable { get; set; }

    public string? ComboSearchName { get; set; }

    public virtual Staff? ComboCreateByNavigation { get; set; }

    public virtual ICollection<ComboDetail> ComboDetails { get; set; } = new List<ComboDetail>();

    public virtual ICollection<OrderDetailCombo> OrderDetailCombos { get; set; } = new List<OrderDetailCombo>();
}
