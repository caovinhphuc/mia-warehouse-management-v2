# google_sheets_connector.py
# Mô-đun kết nối và tương tác với Google Sheets API
# Dành cho dự án OneAutomationSystem

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json
from datetime import datetime, timedelta
import seaborn as sns

class GoogleSheetsConnector:
    """
    Lớp xử lý kết nối và tương tác với Google Sheets API
    cho dự án OneAutomationSystem
    """
    def __init__(self, credentials_path=None, sheet_id=None):
        """
        Khởi tạo kết nối với Google Sheets API

        Args:
            credentials_path (str): Đường dẫn tới file credentials JSON
            sheet_id (str): ID của Google Sheet
        """
        # Đường dẫn mặc định trong trường hợp không cung cấp
        self.credentials_path = credentials_path or os.environ.get('GOOGLE_CREDENTIALS_PATH')
        self.sheet_id = sheet_id or os.environ.get('GOOGLE_SHEET_ID')

        self.scopes = ['https://www.googleapis.com/auth/spreadsheets']
        self.service = None

        # In thông tin kết nối
        print(f"🔄 Đang kết nối tới Google Sheets API...")
        print(f"📝 Sheet ID: {self.sheet_id}")

        # Thử kết nối
        try:
            self._connect()
            print("✅ Kết nối Google Sheets API thành công!")
        except Exception as e:
            print(f"❌ Lỗi kết nối: {str(e)}")
            raise

    def _connect(self):
        """Thiết lập kết nối tới Google Sheets API"""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_path, scopes=self.scopes
            )
            self.service = build('sheets', 'v4', credentials=credentials)
        except FileNotFoundError:
            raise FileNotFoundError(f"Không tìm thấy file credentials tại {self.credentials_path}")
        except Exception as e:
            raise Exception(f"Lỗi kết nối Google Sheets API: {str(e)}")

    def read_sheet(self, sheet_name, range_name=None):
        """
        Đọc dữ liệu từ một sheet

        Args:
            sheet_name (str): Tên sheet (ví dụ: 'Dashboard', 'UserData')
            range_name (str, optional): Phạm vi đọc (ví dụ: 'A1:F10')

        Returns:
            list: Dữ liệu từ sheet
        """
        if not range_name:
            range_name = f"{sheet_name}!A1:Z1000"  # Mặc định đọc toàn bộ dữ liệu
        else:
            range_name = f"{sheet_name}!{range_name}"

        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.sheet_id,
                range=range_name
            ).execute()

            values = result.get('values', [])
            print(f"📊 Đã đọc {len(values)} dòng từ {sheet_name}")

            return values
        except HttpError as error:
            print(f"❌ Lỗi khi đọc dữ liệu: {error}")
            return []

    def write_sheet(self, sheet_name, values, range_start='A1'):
        """
        Ghi dữ liệu vào sheet

        Args:
            sheet_name (str): Tên sheet (ví dụ: 'Dashboard', 'UserData')
            values (list): Dữ liệu cần ghi, dạng list of lists
            range_start (str): Ô bắt đầu ghi (ví dụ: 'A1')

        Returns:
            dict: Kết quả từ API
        """
        try:
            range_name = f"{sheet_name}!{range_start}"
            body = {
                'values': values
            }

            result = self.service.spreadsheets().values().update(
                spreadsheetId=self.sheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()

            print(f"✅ Đã cập nhật {result.get('updatedCells')} ô tại {sheet_name}")
            return result
        except HttpError as error:
            print(f"❌ Lỗi khi ghi dữ liệu: {error}")
            raise

    def append_sheet(self, sheet_name, values):
        """
        Thêm dữ liệu vào cuối sheet

        Args:
            sheet_name (str): Tên sheet (ví dụ: 'Dashboard', 'UserData')
            values (list): Dữ liệu cần thêm, dạng list of lists

        Returns:
            dict: Kết quả từ API
        """
        try:
            range_name = f"{sheet_name}!A1:Z1"
            body = {
                'values': values
            }

            result = self.service.spreadsheets().values().append(
                spreadsheetId=self.sheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()

            print(f"✅ Đã thêm {len(values)} dòng vào {sheet_name}")
            return result
        except HttpError as error:
            print(f"❌ Lỗi khi thêm dữ liệu: {error}")
            raise

    def clear_sheet(self, sheet_name, range_name=None):
        """
        Xóa dữ liệu trong một phạm vi của sheet

        Args:
            sheet_name (str): Tên sheet (ví dụ: 'Dashboard', 'UserData')
            range_name (str, optional): Phạm vi cần xóa (ví dụ: 'A2:F10')

        Returns:
            dict: Kết quả từ API
        """
        if not range_name:
            range_name = f"{sheet_name}!A2:Z1000"  # Mặc định xóa toàn bộ dữ liệu, giữ lại header
        else:
            range_name = f"{sheet_name}!{range_name}"

        try:
            result = self.service.spreadsheets().values().clear(
                spreadsheetId=self.sheet_id,
                range=range_name,
                body={}
            ).execute()

            print(f"🧹 Đã xóa dữ liệu từ {range_name}")
            return result
        except HttpError as error:
            print(f"❌ Lỗi khi xóa dữ liệu: {error}")
            raise

    def to_dataframe(self, sheet_name, range_name=None):
        """
        Đọc dữ liệu từ sheet và chuyển đổi thành Pandas DataFrame

        Args:
            sheet_name (str): Tên sheet (ví dụ: 'Dashboard', 'UserData')
            range_name (str, optional): Phạm vi đọc (ví dụ: 'A1:F10')

        Returns:
            DataFrame: Pandas DataFrame chứa dữ liệu
        """
        data = self.read_sheet(sheet_name, range_name)

        if not data:
            return pd.DataFrame()

        # Lấy header từ dòng đầu tiên
        headers = data[0]

        # Chuyển đổi các dòng dữ liệu
        rows = data[1:] if len(data) > 1 else []

        # Tạo DataFrame
        df = pd.DataFrame(rows, columns=headers)

        return df

    def from_dataframe(self, df, sheet_name, include_header=True, start_row=1):
        """
        Ghi DataFrame vào sheet

        Args:
            df (DataFrame): Pandas DataFrame chứa dữ liệu
            sheet_name (str): Tên sheet đích
            include_header (bool): Có ghi header không
            start_row (int): Dòng bắt đầu (1 là dòng đầu tiên)

        Returns:
            dict: Kết quả từ API
        """
        # Chuyển đổi DataFrame thành values
        values = []

        # Thêm header nếu cần
        if include_header:
            values.append(df.columns.tolist())

        # Thêm dữ liệu
        for _, row in df.iterrows():
            values.append(row.tolist())

        # Xác định vị trí bắt đầu
        range_start = f"A{start_row}"

        # Ghi dữ liệu
        return self.write_sheet(sheet_name, values, range_start)

    def generate_analytics_dashboard(self, output_path='dashboard_analytics.png'):
        """
        Tạo dashboard phân tích dữ liệu từ Google Sheets

        Args:
            output_path (str): Đường dẫn lưu file hình

        Returns:
            str: Đường dẫn đến file hình đã lưu
        """
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Noto Sans CJK JP', 'DejaVu Sans']
        plt.rcParams['axes.unicode_minus'] = False

        # Đọc dữ liệu
        try:
            dashboard_df = self.to_dataframe('Dashboard')
            user_df = self.to_dataframe('UserData')
            analytics_df = self.to_dataframe('Analytics')

            # Kiểm tra nếu có dữ liệu
            if dashboard_df.empty or user_df.empty:
                print("❌ Không đủ dữ liệu để tạo dashboard")
                return None

            # Chuẩn bị dữ liệu
            # Chuyển đổi cột Date sang định dạng datetime
            if 'Date' in dashboard_df.columns:
                dashboard_df['Date'] = pd.to_datetime(dashboard_df['Date'], errors='coerce')

            # Chuyển đổi cột Users, Revenue sang dạng số
            if 'Users' in dashboard_df.columns:
                dashboard_df['Users'] = pd.to_numeric(dashboard_df['Users'], errors='coerce')
            if 'Revenue' in dashboard_df.columns:
                dashboard_df['Revenue'] = pd.to_numeric(dashboard_df['Revenue'], errors='coerce')

            # Tạo hình thống kê
            fig = plt.figure(figsize=(15, 12))
            fig.suptitle('OneAutomationSystem Analytics Dashboard', fontsize=16)

            # 1. Biểu đồ người dùng theo thời gian
            ax1 = plt.subplot(2, 2, 1)
            if 'Date' in dashboard_df.columns and 'Users' in dashboard_df.columns:
                dashboard_df.sort_values('Date').plot(x='Date', y='Users', marker='o', ax=ax1)
                ax1.set_title('Số lượng người dùng theo thời gian')
                ax1.set_ylabel('Số người dùng')
                ax1.set_xlabel('Ngày')
                ax1.grid(True, linestyle='--', alpha=0.7)

            # 2. Biểu đồ doanh thu
            ax2 = plt.subplot(2, 2, 2)
            if 'Date' in dashboard_df.columns and 'Revenue' in dashboard_df.columns:
                dashboard_df.sort_values('Date').plot(x='Date', y='Revenue', kind='bar', ax=ax2)
                ax2.set_title('Doanh thu theo ngày')
                ax2.set_ylabel('Doanh thu')
                ax2.set_xlabel('Ngày')
                ax2.grid(True, linestyle='--', alpha=0.7)

            # 3. Phân bố người dùng theo kế hoạch
            ax3 = plt.subplot(2, 2, 3)
            if 'Plan' in user_df.columns:
                user_df['Plan'].value_counts().plot(kind='pie', autopct='%1.1f%%', ax=ax3)
                ax3.set_title('Phân bố người dùng theo kế hoạch')

            # 4. Thêm số liệu tổng hợp
            ax4 = plt.subplot(2, 2, 4)
            ax4.axis('off')

            summary_text = "THỐNG KÊ TỔNG HỢP\n\n"

            # Tổng số người dùng
            if 'UserID' in user_df.columns:
                total_users = len(user_df['UserID'].unique())
                summary_text += f"• Tổng số người dùng: {total_users}\n"

            # Tổng doanh thu
            if 'Revenue' in dashboard_df.columns:
                total_revenue = dashboard_df['Revenue'].astype(float).sum()
                summary_text += f"• Tổng doanh thu: {total_revenue:,.2f}\n"

            # Số lượng domains
            if 'Domain' in user_df.columns:
                total_domains = len(user_df['Domain'].unique())
                summary_text += f"• Số lượng domains: {total_domains}\n"

            # Người dùng hoạt động gần đây
            if 'LastLogin' in user_df.columns:
                user_df['LastLogin'] = pd.to_datetime(user_df['LastLogin'], errors='coerce')
                recent = (datetime.now() - user_df['LastLogin']).dt.days < 7
                active_users = recent.sum()
                summary_text += f"• Người dùng hoạt động (7 ngày): {active_users}\n"

            ax4.text(0.1, 0.5, summary_text, fontsize=12)

            plt.tight_layout()
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"✅ Đã lưu dashboard tại: {output_path}")

            # Hiển thị dashboard
            plt.show()

            return output_path

        except Exception as e:
            print(f"❌ Lỗi khi tạo dashboard: {str(e)}")
            return None

    def get_sheet_metadata(self):
        """
        Lấy metadata của spreadsheet

        Returns:
            dict: Thông tin của spreadsheet
        """
        try:
            metadata = self.service.spreadsheets().get(
                spreadsheetId=self.sheet_id
            ).execute()

            return metadata
        except HttpError as error:
            print(f"❌ Lỗi khi lấy metadata: {error}")
            return None

# Hàm kiểm tra kết nối
def test_connection(credentials_path=None, sheet_id=None):
    """
    Kiểm tra kết nối với Google Sheets API

    Args:
        credentials_path (str): Đường dẫn tới file credentials JSON
        sheet_id (str): ID của Google Sheet

    Returns:
        bool: True nếu kết nối thành công, False nếu không
    """
    try:
        # Khởi tạo connector
        connector = GoogleSheetsConnector(credentials_path, sheet_id)

        # Lấy metadata
        metadata = connector.get_sheet_metadata()

        if metadata:
            print(f"\n✅ KẾT NỐI THÀNH CÔNG!")
            print(f"📊 Tên spreadsheet: {metadata.get('properties', {}).get('title', 'N/A')}")
            print(f"📑 Số sheets: {len(metadata.get('sheets', []))}")
            print("\nDanh sách sheets:")

            for idx, sheet in enumerate(metadata.get('sheets', [])):
                sheet_title = sheet.get('properties', {}).get('title', 'N/A')
                sheet_id = sheet.get('properties', {}).get('sheetId', 'N/A')
                print(f"  {idx+1}. {sheet_title} (ID: {sheet_id})")

            return True
        else:
            print("❌ Không lấy được metadata của spreadsheet")
            return False

    except Exception as e:
        print(f"❌ Lỗi kiểm tra kết nối: {str(e)}")
        return False

# Tạo dữ liệu mẫu để test
def create_sample_data():
    """
    Tạo dữ liệu mẫu để test

    Returns:
        tuple: (dashboard_data, user_data, analytics_data)
    """
    # Dữ liệu dashboard
    dashboard_headers = ["Date", "Users", "Revenue", "Domains", "Orders", "Status"]
    dashboard_data = [dashboard_headers]

    # Tạo dữ liệu cho 10 ngày
    start_date = datetime.now() - timedelta(days=10)
    users = 1000
    revenue = 10000
    domains = 400
    orders = 80

    for i in range(10):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")

        # Thêm một chút biến động
        users += np.random.randint(-50, 100)
        revenue += np.random.randint(-500, 1000)
        domains += np.random.randint(-5, 10)
        orders += np.random.randint(-3, 5)

        status = "Active"

        dashboard_data.append([date_str, str(users), str(revenue), str(domains), str(orders), status])

    # Dữ liệu người dùng
    user_headers = ["UserID", "Email", "Name", "Domain", "Plan", "CreatedDate", "LastLogin"]
    user_data = [user_headers]

    domains = ["example.com", "test.com", "demo.net", "sample.org", "mysite.vn"]
    plans = ["Free", "Basic", "Premium", "Enterprise"]

    for i in range(1, 21):  # 20 người dùng
        user_id = f"U{i:03d}"
        email = f"user{i}@{domains[i % len(domains)]}"
        name = f"User {i}"
        domain = domains[i % len(domains)]
        plan = plans[i % len(plans)]

        # Ngày đăng ký ngẫu nhiên trong 30 ngày vừa qua
        days_ago = np.random.randint(1, 30)
        created_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        # Ngày login gần đây hơn ngày đăng ký
        login_days_ago = np.random.randint(0, days_ago)
        last_login = (datetime.now() - timedelta(days=login_days_ago)).strftime("%Y-%m-%d")

        user_data.append([user_id, email, name, domain, plan, created_date, last_login])

    # Dữ liệu analytics
    analytics_headers = ["Date", "Event", "Domain", "User", "Value"]
    analytics_data = [analytics_headers]

    events = ["Login", "Order", "PageView", "SignUp", "Renewal"]

    for i in range(50):  # 50 events
        days_ago = np.random.randint(0, 10)
        date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

        event = events[i % len(events)]
        domain = domains[i % len(domains)]
        user = f"user{np.random.randint(1, 21)}@{domain}"
        value = str(np.random.randint(1, 100))

        analytics_data.append([date, event, domain, user, value])

    return (dashboard_data, user_data, analytics_data)

if __name__ == "__main__":
    test_connection(credentials_path="config/service_account.json", sheet_id="1234567890")
