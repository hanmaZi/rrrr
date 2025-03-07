using System.ComponentModel.DataAnnotations;

namespace RestoAPP.Models
{
    public class Foods
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public double price { get; set; }
        public string category { get; set; }

    }
}
