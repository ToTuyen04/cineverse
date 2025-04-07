namespace CinemaManagement.API.ExceptionHandler
{
    public class ValidationException : BaseException
    {
        public ValidationException(string message)
         : base(message, "VALIDATION_ERROR") { }


    }
}
