# CTV User Seeding Script

This script is designed to generate users with the "CTV" (Collaborator) role in the Yen Library system.

## Features

- Creates multiple CTV users with predefined information
- Automatically generates usernames based on full names using the format: lastName + initials
  - Example: "Mai Danh Hiếu" becomes "hieumd"
- Normalizes Vietnamese characters for usernames
- Sets default password "ctv123" for all CTV users

## Usage

To run the script and create CTV users:

```bash
# Navigate to the expressjs directory
cd expressjs

# Run the CTV seeding script
npm run seed:ctv
```

## Sample Users Created

The script will create the following CTV users:

1. Mai Danh Hiếu (hieumd)
2. Nguyễn Văn An (annv)
3. Trần Thị Bình (binhtt)
4. Lê Hoàng Cường (cuonglh)
5. Phạm Minh Đức (ducpm)
6. Hoàng Thị Thảo (thaoht)
7. Vũ Quốc Dũng (dungvq)
8. Ngô Thị Huyền (huyennt)
9. Đặng Thanh Tùng (tungdt)
10. Bùi Xuân Hòa (hoabx)

Each user has:
- Username: As shown in parentheses
- Password: ctv123
- Role: CTV
- Status: Active

## Customization

To add or modify CTV users:

1. Open the `ctvSeed.js` file
2. Edit the `ctvData` array to include your desired users
3. Run the script again

## Note

This script removes existing CTV users (except for the default 'ctv' user) before creating new ones to avoid duplicates.
