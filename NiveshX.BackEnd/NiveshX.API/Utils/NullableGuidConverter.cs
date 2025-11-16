using System.Text.Json;
using System.Text.Json.Serialization;

namespace NiveshX.API.Utils
{
    // Converts empty string -> null and invalid GUID -> null (so [Required] will catch it)
    public class NullableGuidConverter : JsonConverter<Guid?>
    {
        public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null) return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s)) return null;

                if (Guid.TryParse(s, out var g)) return g;

                // Return null when invalid so validation attributes handle it consistently
                return null;
            }

            // If the token is something else (number/object), attempt to get as string then parse
            try
            {
                var s = reader.GetString();
                if (!string.IsNullOrWhiteSpace(s) && Guid.TryParse(s, out var g)) return g;
            }
            catch
            {
                // ignore and return null
            }

            return null;
        }

        public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString());
            else
                writer.WriteNullValue();
        }
    }
}
