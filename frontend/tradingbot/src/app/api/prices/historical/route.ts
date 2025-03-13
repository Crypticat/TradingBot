import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Convert symbol format (e.g., BTC/USD -> XBTUSD)
  // Luno uses XBT instead of BTC for Bitcoin
  let formattedSymbol = symbol?.replace("/", "");
  if (formattedSymbol?.startsWith("BTC")) {
    formattedSymbol = "XBT" + formattedSymbol.substring(3);
  }
  
  try {
    // Proxy to backend - Add the /api/ prefix to the endpoint
    // This is a public endpoint, so we don't need authentication
    const backendUrl = new URL(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/prices/historical`);
    
    if (formattedSymbol) backendUrl.searchParams.append("symbol", formattedSymbol);
    if (interval) backendUrl.searchParams.append("interval", interval);
    if (from) backendUrl.searchParams.append("from", from);
    if (to) backendUrl.searchParams.append("to", to);
    
    console.log(`Fetching historical data from: ${backendUrl.toString()}`);
    const response = await fetch(backendUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
