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
