using System.Text.RegularExpressions;

namespace NiveshX.API.Utils
{
    public static class ErrorFormatting
    {
        // Normalize key: "$.countryId" => "countryId", "items[0].name" => "name", "request" => "__global"
        public static string NormalizeKey(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return "__global";

            if (key.StartsWith("$.") || key.StartsWith("$[")) key = key.Substring(2);

            // convert items[0].name -> items.0.name
            key = Regex.Replace(key, @"\[(\d+)\]", ".$1");

            var parts = key.Split('.', StringSplitOptions.RemoveEmptyEntries);
            var last = parts.Length > 0 ? parts[^1] : key;

            if (string.Equals(last, "request", StringComparison.OrdinalIgnoreCase)) return "__global";
            if (string.IsNullOrEmpty(last)) return "__global";

            return char.ToLowerInvariant(last[0]) + last.Substring(1);
        }

        // Friendly display names for messages: extend this dictionary as needed or load from resources
        public static readonly IDictionary<string, string> FriendlyNames =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "countryId", "Country" },
                { "code", "Code" },
                { "name", "Name" }
            };

        // Normalize message text, e.g. "The Name field is required." => "Name is required."
        public static string NormalizeMessage(string rawMessage, string fieldKey)
        {
            if (string.IsNullOrWhiteSpace(rawMessage)) return rawMessage ?? string.Empty;

            var requiredPattern = new Regex(@"^The\s+(?<prop>.+?)\s+field\s+is\s+required\.$", RegexOptions.IgnoreCase);
            var m = requiredPattern.Match(rawMessage);
            if (m.Success)
            {
                var propName = m.Groups["prop"].Value;
                var keyLabel = fieldKey != "__global" && FriendlyNames.TryGetValue(fieldKey, out var friendly) ? friendly : propName;
                return $"{keyLabel} is required.";
            }

            var simplePattern = new Regex(@"^\s*The\s+(?<prop>.+?)\s+field\s+(?<rest>.+)$", RegexOptions.IgnoreCase);
            m = simplePattern.Match(rawMessage);
            if (m.Success)
            {
                var propName = m.Groups["prop"].Value;
                var rest = m.Groups["rest"].Value.Trim();
                var keyLabel = fieldKey != "__global" && FriendlyNames.TryGetValue(fieldKey, out var friendly) ? friendly : propName;
                return $"{keyLabel} {rest.TrimEnd('.')}.";
            }

            return rawMessage;
        }

        // Convert ModelStateDictionary-style key to normalized field name using NormalizeKey wrapper
        public static string NormalizeModelStateKey(string modelStateKey) => NormalizeKey(modelStateKey);
    }
}
