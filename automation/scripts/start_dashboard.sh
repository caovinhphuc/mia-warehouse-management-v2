#!/bin/bash

# Start Dashboard - Khởi động Web Dashboard

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   🌐 WEB DASHBOARD                          ║${NC}"
echo -e "${CYAN}║              Interactive Data Visualization                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}❌ Virtual environment chưa được tạo${NC}"
    echo -e "${YELLOW}🔧 Chạy './setup.sh' trước...${NC}"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if data exists
if [ ! -f "data/orders_latest.csv" ]; then
    echo -e "${YELLOW}⚠️ Chưa có dữ liệu để hiển thị${NC}"
    echo -e "${BLUE}💡 Chạy automation trước để có dữ liệu:${NC}"
    echo "   • Quick run: './quick_run.sh'"
    echo "   • Full run: python automation.py"
    echo ""
    read -p "Bạn có muốn tạo data mẫu không? (y/n): " create_sample

    if [[ $create_sample =~ ^[Yy] ]]; then
        echo -e "${BLUE}📊 Tạo data mẫu...${NC}"
        python -c "
import pandas as pd
import os
from datetime import datetime, timedelta
import random

# Create sample data
sample_data = []
platforms = ['Shopee', 'TikTok', 'Lazada', 'Sendo']
products = ['Áo thun', 'Quần jean', 'Giày sneaker', 'Túi xách', 'Đồng hồ']

for i in range(50):
    sample_data.append({
        'id': f'ORD{i+1:03d}',
        'order_code': f'{random.choice(platforms)}-{random.randint(10000,99999)}',
        'customer': f'Customer {i+1}',
        'product_summary': f'{random.choice(products)} ({random.randint(1,5)})',
        'amount': f'{random.randint(100,1000)}000',
        'status': random.choice(['Pending', 'Processing', 'Shipped', 'Delivered']),
        'created_at': (datetime.now() - timedelta(days=random.randint(0,7))).strftime('%Y-%m-%d %H:%M:%S'),
        'platform': random.choice(platforms.lower() for platforms in platforms)
    })

# Create data directory
os.makedirs('data', exist_ok=True)

# Save to CSV
df = pd.DataFrame(sample_data)
df.to_csv('data/orders_latest.csv', index=False, encoding='utf-8-sig')
print('✅ Đã tạo 50 đơn hàng mẫu')
"
    fi
fi

echo -e "${BLUE}🌐 Khởi động Web Dashboard...${NC}"
echo ""

# Create simple dashboard script if not exists
if [ ! -f "dashboard.py" ]; then
    echo -e "${YELLOW}📝 Tạo dashboard script...${NC}"
    cat > dashboard.py << 'EOF'
#!/usr/bin/env python3
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import os

# Page config
st.set_page_config(
    page_title="Warehouse Automation Dashboard",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Title
st.title("🏭 Warehouse Automation Dashboard")
st.markdown("---")

# Load data
@st.cache_data
def load_data():
    try:
        if os.path.exists('data/orders_latest.csv'):
            df = pd.read_csv('data/orders_latest.csv')
            return df
        else:
            st.error("❌ Không tìm thấy file dữ liệu: data/orders_latest.csv")
            return pd.DataFrame()
    except Exception as e:
        st.error(f"❌ Lỗi đọc dữ liệu: {e}")
        return pd.DataFrame()

df = load_data()

if not df.empty:
    # Sidebar filters
    st.sidebar.header("🔍 Bộ lọc")

    # Platform filter
    if 'platform' in df.columns:
        platforms = ['Tất cả'] + list(df['platform'].unique())
        selected_platform = st.sidebar.selectbox("Platform", platforms)

        if selected_platform != 'Tất cả':
            df = df[df['platform'] == selected_platform]

    # Status filter
    if 'status' in df.columns:
        statuses = ['Tất cả'] + list(df['status'].unique())
        selected_status = st.sidebar.selectbox("Trạng thái", statuses)

        if selected_status != 'Tất cả':
            df = df[df['status'] == selected_status]

    # Metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("📦 Tổng đơn hàng", len(df))

    with col2:
        if 'amount' in df.columns:
            total_amount = df['amount'].str.replace('[^0-9]', '', regex=True).astype(int).sum()
            st.metric("💰 Tổng doanh thu", f"{total_amount:,} VNĐ")
        else:
            st.metric("💰 Tổng doanh thu", "N/A")

    with col3:
        if 'platform' in df.columns:
            platforms_count = df['platform'].nunique()
            st.metric("🛒 Số platform", platforms_count)
        else:
            st.metric("🛒 Số platform", "N/A")

    with col4:
        if 'created_at' in df.columns:
            df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
            today_orders = len(df[df['created_at'].dt.date == datetime.now().date()])
            st.metric("📅 Đơn hôm nay", today_orders)
        else:
            st.metric("📅 Đơn hôm nay", "N/A")

    st.markdown("---")

    # Charts
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📊 Đơn hàng theo Platform")
        if 'platform' in df.columns:
            platform_counts = df['platform'].value_counts()
            fig = px.pie(
                values=platform_counts.values,
                names=platform_counts.index,
                title="Phân bố đơn hàng theo Platform"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Không có dữ liệu platform")

    with col2:
        st.subheader("📈 Đơn hàng theo Trạng thái")
        if 'status' in df.columns:
            status_counts = df['status'].value_counts()
            fig = px.bar(
                x=status_counts.index,
                y=status_counts.values,
                title="Số lượng đơn hàng theo Trạng thái"
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Không có dữ liệu trạng thái")

    # Time series
    if 'created_at' in df.columns:
        st.subheader("📅 Xu hướng đơn hàng theo thời gian")
        df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')
        df['date'] = df['created_at'].dt.date
        daily_orders = df.groupby('date').size().reset_index(name='orders')

        fig = px.line(
            daily_orders,
            x='date',
            y='orders',
            title="Số đơn hàng theo ngày"
        )
        st.plotly_chart(fig, use_container_width=True)

    # Data table
    st.subheader("📋 Bảng dữ liệu chi tiết")
    st.dataframe(df, use_container_width=True)

    # Download button
    csv = df.to_csv(index=False, encoding='utf-8-sig')
    st.download_button(
        label="📥 Tải xuống CSV",
        data=csv,
        file_name=f"orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv"
    )

else:
    st.warning("⚠️ Không có dữ liệu để hiển thị")
    st.info("💡 Chạy automation để tạo dữ liệu:")
    st.code("./quick_run.sh")
    st.code("python automation.py")

# Footer
st.markdown("---")
st.markdown("🏭 **Warehouse Automation System v2.1** | Powered by Streamlit")
EOF
fi

# Start Streamlit dashboard
echo -e "${GREEN}🚀 Dashboard đang khởi động...${NC}"
echo ""
echo -e "${BLUE}📱 Dashboard sẽ mở tại:${NC}"
echo -e "${CYAN}   Local:     http://localhost:8501${NC}"
echo -e "${CYAN}   Network:   http://$(hostname -I | awk '{print $1}'):8501${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • Ctrl+C để dừng dashboard"
echo "   • F5 để refresh dữ liệu"
echo "   • Sử dụng sidebar để filter"
echo ""

# Run Streamlit
streamlit run dashboard.py --server.port 8501 --server.address 0.0.0.0
