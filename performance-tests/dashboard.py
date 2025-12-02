import streamlit as st
import pandas as pd
import re
import matplotlib.pyplot as plt
import numpy as np

st.set_page_config(page_title="Darknet Duel Performance Dashboard", layout="wide")

def parse_markdown_table(markdown_content, start_marker, end_marker=None):
    lines = markdown_content.split('\n')
    table_lines = []
    capture = False
    
    for line in lines:
        if start_marker in line:
            capture = True
            continue
        if capture:
            if end_marker and end_marker in line:
                break
            if line.strip() == '' or line.startswith('#'):
                continue
            if '|' in line:
                table_lines.append(line)
    
    if not table_lines:
        return pd.DataFrame()

    # Parse header
    header = [c.strip() for c in table_lines[0].split('|') if c.strip()]
    
    # Parse data
    data = []
    for line in table_lines[2:]: # Skip header and separator
        row = [c.strip() for c in line.split('|') if c.strip()]
        if len(row) == len(header):
            data.append(row)
            
    df = pd.DataFrame(data, columns=header)
    return df

def load_data():
    try:
        with open('performance-report.md', 'r') as f:
            content = f.read()
            
        # Parse Batch Progression
        batch_df = parse_markdown_table(content, "## Batch Progression", "## Detailed Metrics")
        if not batch_df.empty:
            batch_df['Batch Size'] = pd.to_numeric(batch_df['Batch Size'])
            batch_df['Max Latency (ms)'] = pd.to_numeric(batch_df['Max Latency (ms)'])
            batch_df['Success'] = pd.to_numeric(batch_df['Success'])
            batch_df['Failed'] = pd.to_numeric(batch_df['Failed'])

        # Parse Detailed Metrics
        detail_df = parse_markdown_table(content, "## Detailed Metrics")
        if not detail_df.empty:
            cols_to_numeric = ['Register', 'Login', 'Profile', 'Lobby', 'Socket', 'Update', 'Search', 'Total']
            for col in cols_to_numeric:
                if col in detail_df.columns:
                    detail_df[col] = pd.to_numeric(detail_df[col], errors='coerce')
            
            # Fix User sorting
            if 'User' in detail_df.columns:
                detail_df['User'] = pd.to_numeric(detail_df['User'])
                detail_df = detail_df.sort_values('User')
            
        return batch_df, detail_df
    except FileNotFoundError:
        st.error("performance-report.md not found. Please run the stress test first.")
        return pd.DataFrame(), pd.DataFrame()

st.title("🚀 Darknet Duel Performance Dashboard")

batch_df, detail_df = load_data()

if not batch_df.empty:
    st.header("📈 Batch Scalability")
    
    col1, col2, col3 = st.columns(3)
    max_users = batch_df[batch_df['Status'] == 'PASS']['Batch Size'].max()
    max_latency = batch_df['Max Latency (ms)'].max()
    
    col1.metric("Max Stable Concurrent Users", f"{max_users}")
    col2.metric("Peak Latency Observed", f"{max_latency} ms")
    col3.metric("Total Batches Run", f"{len(batch_df)}")

    # Latency Chart
    st.subheader("Latency vs Concurrency")
    
    # Prediction Logic
    if len(batch_df) > 2:
        x = batch_df['Batch Size'].values
        y = batch_df['Max Latency (ms)'].values
        
        # Fit polynomial (degree 2)
        z = np.polyfit(x, y, 2)
        p = np.poly1d(z)
        
        # Find theoretical max users (where latency = 5000)
        # Solve p(x) - 5000 = 0
        roots = (p - 5000).roots
        real_roots = [r for r in roots if np.isreal(r) and r > max_users]
        
        predicted_max = int(min(real_roots).real) if real_roots else "Unknown"
        
        st.info(f"🔮 **Prediction:** Based on current trends, the system could theoretically handle **{predicted_max}** users before hitting 5000ms latency.")
        
        # Plot projection
        if isinstance(predicted_max, int):
            x_pred = np.linspace(x.min(), predicted_max + 10, 100)
            y_pred = p(x_pred)
            
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.scatter(x, y, label='Actual Data', color='blue')
            ax.plot(x_pred, y_pred, '--', label='Trend Line (Poly Deg 2)', color='orange')
            ax.axhline(y=5000, color='red', linestyle=':', label='Threshold (5000ms)')
            ax.set_xlabel("Concurrent Users")
            ax.set_ylabel("Max Latency (ms)")
            ax.legend()
            st.pyplot(fig)
        else:
            st.line_chart(batch_df.set_index('Batch Size')['Max Latency (ms)'])
    else:
        st.line_chart(batch_df.set_index('Batch Size')['Max Latency (ms)'])

if not detail_df.empty:
    st.header("🔬 Detailed Metrics (Last Batch)")
    st.markdown(f"**Batch Size:** {len(detail_df)} Users")

    # Stacked Bar Chart for Breakdown
    st.subheader("Operation Latency Breakdown per User")
    steps = ['Register', 'Login', 'Profile', 'Lobby', 'Socket', 'Update', 'Search']
    
    # Ensure User is treated as ordinal/categorical for the chart to respect sort order
    chart_data = detail_df.set_index('User')[steps]
    st.bar_chart(chart_data)

    # Distribution
    st.subheader("Latency Distribution by Operation")
    
    # Prepare data for boxplot
    fig, ax = plt.subplots(figsize=(10, 6))
    detail_df[steps].boxplot(ax=ax)
    ax.set_ylabel("Latency (ms)")
    ax.set_title("Latency Spread per Operation")
    st.pyplot(fig)

    st.subheader("Raw Data")
    st.dataframe(detail_df)
else:
    st.warning("No detailed metrics found in report.")
