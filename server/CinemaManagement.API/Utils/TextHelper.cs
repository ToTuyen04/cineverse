using System;
using System.Globalization;
using System.Text;

namespace CinemaManagement.API.Utils
{
    public static class TextHelper
    {
        /// <summary>
        /// Removes diacritics (accent marks) from a string
        /// </summary>
        /// <param name="text">The text to process</param>
        /// <returns>The text without diacritics</returns>
        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            string normalizedString = text.Normalize(NormalizationForm.FormD);
            StringBuilder stringBuilder = new StringBuilder();

            foreach (char c in normalizedString)
            {
                UnicodeCategory unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        /// <summary>
        /// Creates a search-friendly version of text by converting to lowercase and removing diacritics
        /// </summary>
        /// <param name="text">The text to convert</param>
        /// <returns>Search-friendly text</returns>
        public static string ToSearchFriendlyText(string text)
        {
            if (string.IsNullOrEmpty(text))
                return string.Empty;

            return RemoveDiacritics(text.ToLowerInvariant());
        }
    }
}