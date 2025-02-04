public class User
{
    public int Id { get; set; } // Идентификатор пользователя
    public string Email { get; set; } // Электронная почта пользователя
    public string PasswordHash { get; set; } // Хэш пароля
    public string UserName { get; set; } // Имя пользователя
    public string WalletAddress { get; set; } // Адрес кошелька (например, из Ganache)
    public DateTime CreatedAt { get; set; } // Дата создания аккаунта
}