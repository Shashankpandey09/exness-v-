interface UserType {
  userId: number;
  usd_balance: number;
}

export class User {
  private static instance: User;
  private userAccount = new Map<number, UserType>();
  private readonly DEFAULT_BALANCE = 5000;
  private constructor() {}

  public static getInstance(): User {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

 public getBalance(userId: number): number {
    let account = this.userAccount.get(userId);
    if (!account) {
      account = { userId, usd_balance: this.DEFAULT_BALANCE };
      this.userAccount.set(userId, account);
    }
    return account.usd_balance;
  }

  // optional if you want to add/subtract instead of replace
 public updateBalance(userId: number, delta: number): number {
    if (!Number.isFinite(delta)) throw new Error("Invalid delta");

    let account = this.userAccount.get(userId);
    if (!account) {
      account = { userId, usd_balance: this.DEFAULT_BALANCE };
    }

    const newBalance = delta;

    // optional: prevent negative balances
    if (newBalance < 0) {
      throw new Error("Insufficient funds");
    }

    account.usd_balance = newBalance;
    this.userAccount.set(userId, account);

    return account.usd_balance;
  }
}
