namespace CinemaManagement.API.DTOs.Request
{
    public class PaymentCallbackRequestDTO
    {
        public string vnp_ResponseCode { get; set; }
        public string vnp_TransactionStatus { get; set; }
        public string vnp_TxnRef { get; set; }
        public string vnp_TransactionNo { get; set; }
        public string vnp_Amount { get; set; }
        public string vnp_BankCode { get; set; }
        public string vnp_PayDate { get; set; }
    }
}
