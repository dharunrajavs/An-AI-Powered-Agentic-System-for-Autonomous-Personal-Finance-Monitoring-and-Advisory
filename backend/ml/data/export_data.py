"""Export mock transaction data as JSON for training."""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__))

TRANSACTIONS = [
    {"id": "txn_001", "date": "2026-07-06", "time": None, "amount": -6.75, "category": "Food & Drink", "merchant": "Starbucks", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_002", "date": "2026-07-06", "time": None, "amount": -84.32, "category": "Groceries", "merchant": "Whole Foods Market", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_003", "date": "2026-07-05", "time": None, "amount": -18.40, "category": "Transport", "merchant": "Uber", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_004", "date": "2026-07-05", "time": None, "amount": -340.00, "category": "Shopping", "merchant": "Amazon", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": True, "source": "manual"},
    {"id": "txn_005", "date": "2026-07-04", "time": None, "amount": -15.99, "category": "Subscriptions", "merchant": "Netflix", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_006", "date": "2026-07-04", "time": None, "amount": -52.10, "category": "Food & Drink", "merchant": "Chipotle Mexican Grill", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_007", "date": "2026-07-03", "time": None, "amount": -9.99, "category": "Subscriptions", "merchant": "Spotify", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_008", "date": "2026-07-03", "time": None, "amount": -64.21, "category": "Transport", "merchant": "Shell", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_009", "date": "2026-07-02", "time": None, "amount": -128.50, "category": "Shopping", "merchant": "Target", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_010", "date": "2026-07-02", "time": None, "amount": -22.00, "category": "Entertainment", "merchant": "AMC Theatres", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_011", "date": "2026-07-01", "time": None, "amount": -2400.00, "category": "Rent", "merchant": "Parkview Rentals LLC", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_012", "date": "2026-07-01", "time": None, "amount": 4200.00, "category": "Income", "merchant": "Acme Corp Payroll", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_013", "date": "2026-06-30", "time": None, "amount": -76.43, "category": "Groceries", "merchant": "Trader Joe's", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_014", "date": "2026-06-29", "time": None, "amount": -45.00, "category": "Fitness", "merchant": "Planet Fitness", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_015", "date": "2026-06-28", "time": None, "amount": -112.87, "category": "Personal Care", "merchant": "Sephora", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_016", "date": "2026-06-27", "time": None, "amount": -38.60, "category": "Food & Drink", "merchant": "Chipotle Mexican Grill", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_017", "date": "2026-06-26", "time": None, "amount": -410.22, "category": "Travel", "merchant": "Delta Air Lines", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_018", "date": "2026-06-25", "time": None, "amount": -18.99, "category": "Health", "merchant": "CVS Pharmacy", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_019", "date": "2026-06-24", "time": None, "amount": -145.00, "category": "Utilities", "merchant": "Con Edison", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_020", "date": "2026-06-23", "time": None, "amount": -85.00, "category": "Utilities", "merchant": "Verizon Wireless", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_021", "date": "2026-06-22", "time": None, "amount": -63.14, "category": "Groceries", "merchant": "Whole Foods Market", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_022", "date": "2026-06-21", "time": None, "amount": -29.50, "category": "Food & Drink", "merchant": "Starbucks", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": True, "source": "manual"},
    {"id": "txn_023", "date": "2026-06-20", "time": None, "amount": -220.00, "category": "Shopping", "merchant": "Amazon", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_024", "date": "2026-06-19", "time": None, "amount": -14.40, "category": "Transport", "merchant": "Uber", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_025", "date": "2026-06-18", "time": None, "amount": -98.00, "category": "Entertainment", "merchant": "Airbnb", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_026", "date": "2026-06-17", "time": None, "amount": -12.99, "category": "Subscriptions", "merchant": "Apple", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_027", "date": "2026-06-16", "time": None, "amount": -210.34, "category": "Groceries", "merchant": "Costco Wholesale", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_028", "date": "2026-06-15", "time": None, "amount": -55.00, "category": "Food & Drink", "merchant": "Chipotle Mexican Grill", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_029", "date": "2026-06-14", "time": None, "amount": -6.75, "category": "Food & Drink", "merchant": "Starbucks", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_030", "date": "2026-06-01", "time": None, "amount": -2400.00, "category": "Rent", "merchant": "Parkview Rentals LLC", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_031", "date": "2026-06-01", "time": None, "amount": 4200.00, "category": "Income", "merchant": "Acme Corp Payroll", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_032", "date": "2026-07-06", "time": "13:20", "amount": -180.00, "category": "Food", "merchant": "Street food", "account": "Cash", "paymentMethod": "cash", "flagged": False, "source": "manual"},
    {"id": "txn_033", "date": "2026-07-04", "time": "09:05", "amount": -60.00, "category": "Transport", "merchant": "Auto rickshaw", "account": "Cash", "paymentMethod": "cash", "flagged": False, "source": "manual"},
    {"id": "txn_034", "date": "2026-06-29", "time": "18:45", "amount": -450.00, "category": "Shopping", "merchant": "Local market", "account": "Cash", "paymentMethod": "cash", "flagged": False, "source": "manual"},
    {"id": "txn_035", "date": "2026-06-24", "time": "11:00", "amount": -220.00, "category": "Healthcare", "merchant": "Pharmacy", "account": "Cash", "paymentMethod": "cash", "flagged": False, "source": "manual"},
    {"id": "txn_036", "date": "2026-08-18", "time": None, "amount": -32.50, "category": "Food & Drink", "merchant": "Starbucks", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_037", "date": "2026-08-16", "time": None, "amount": -118.99, "category": "Shopping", "merchant": "Amazon", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_038", "date": "2026-08-14", "time": None, "amount": -19.40, "category": "Transport", "merchant": "Uber", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_039", "date": "2026-08-12", "time": None, "amount": -14.99, "category": "Entertainment", "merchant": "Netflix", "account": "Chase Checking", "paymentMethod": "upi", "flagged": False, "source": "manual"},
    {"id": "txn_040", "date": "2026-08-10", "time": None, "amount": -58.75, "category": "Food & Drink", "merchant": "Chipotle Mexican Grill", "account": "Chase Sapphire Credit Card", "paymentMethod": "upi", "flagged": False, "source": "manual"},
]

BUDGETS = [
    {"id": "bud_001", "category": "Food & Drink", "limit": 500, "spent": 412.75, "period": "monthly"},
    {"id": "bud_002", "category": "Groceries", "limit": 450, "spent": 380.10, "period": "monthly"},
    {"id": "bud_003", "category": "Transport", "limit": 200, "spent": 145.20, "period": "monthly"},
    {"id": "bud_004", "category": "Subscriptions", "limit": 60, "spent": 58.97, "period": "monthly"},
    {"id": "bud_005", "category": "Shopping", "limit": 300, "spent": 340.50, "period": "monthly"},
    {"id": "bud_006", "category": "Entertainment", "limit": 150, "spent": 90.00, "period": "monthly"},
    {"id": "bud_007", "category": "Utilities", "limit": 250, "spent": 230.00, "period": "monthly"},
    {"id": "bud_008", "category": "Fitness", "limit": 60, "spent": 45.00, "period": "monthly"},
]

GOALS = [
    {"id": "goal_001", "name": "Emergency Fund", "targetAmount": 10000, "currentAmount": 6200, "targetDate": "2026-12-31", "linkedAccount": "Ally Savings"},
    {"id": "goal_002", "name": "Hawaii Trip", "targetAmount": 4000, "currentAmount": 1200, "targetDate": "2026-11-01", "linkedAccount": "Ally Savings"},
    {"id": "goal_003", "name": "New Car Down Payment", "targetAmount": 8000, "currentAmount": 7800, "targetDate": "2026-08-01", "linkedAccount": "Chase Checking"},
    {"id": "goal_004", "name": "Home Down Payment", "targetAmount": 50000, "currentAmount": 12000, "targetDate": "2029-01-01", "linkedAccount": "Ally Savings"},
]

ACCOUNTS = [
    {"id": "acct_001", "institution": "Chase", "nickname": "Chase Checking", "mask": "4821", "balance": 3240.55, "syncStatus": "synced"},
    {"id": "acct_002", "institution": "Chase", "nickname": "Chase Sapphire Credit Card", "mask": "7710", "balance": -1284.32, "syncStatus": "synced"},
    {"id": "acct_003", "institution": "Ally Bank", "nickname": "Ally Savings", "mask": "0093", "balance": 27300.00, "syncStatus": "synced"},
]


def save_json(data, filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved {path}")


def export_all():
    save_json(TRANSACTIONS, "transactions.json")
    save_json(BUDGETS, "budgets.json")
    save_json(GOALS, "goals.json")
    save_json(ACCOUNTS, "accounts.json")
    all_data = {
        "transactions": TRANSACTIONS,
        "budgets": BUDGETS,
        "goals": GOALS,
        "accounts": ACCOUNTS,
    }
    save_json(all_data, "all_data.json")
    print(f"\nExported {len(TRANSACTIONS)} transactions, {len(BUDGETS)} budgets, {len(GOALS)} goals, {len(ACCOUNTS)} accounts.")


if __name__ == "__main__":
    export_all()
