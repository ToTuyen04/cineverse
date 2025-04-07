namespace CinemaManagement.API.Enums
{
    public static class ConfigUnitExtensions
    {
        public static string ToDisplayString(this ConfigUnit unit)
        {
            return unit switch
            {
                ConfigUnit.Phut => "Phút",
                ConfigUnit.Ngay => "Ngày",
                ConfigUnit.DiemNghin => "Điểm/1000",
                ConfigUnit.NgayThang => "Ngày/Tháng",
                ConfigUnit.Vnd => "VNĐ",
                ConfigUnit.SoLuong => "Số lượng",
                _ => string.Empty
            };
        }

        public static ConfigUnit FromString(string unitString)
        {
            return unitString switch
            {
                "Phút" => ConfigUnit.Phut,
                "Ngày" => ConfigUnit.Ngay,
                "Điểm/1000" => ConfigUnit.DiemNghin,
                "Ngày/Tháng" => ConfigUnit.NgayThang,
                "VNĐ" => ConfigUnit.Vnd,
                "Số lượng" => ConfigUnit.SoLuong,
                _ => ConfigUnit.SoLuong
            };
        }
    }
}
