using System.ComponentModel.DataAnnotations;

namespace RestoAPP.Models
{
    public class Users
    {
 
        [Key]
        public int id { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public string role { get; set; }
    }
}
