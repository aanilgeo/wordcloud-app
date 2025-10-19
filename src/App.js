import React, { Component } from "react";
import "./App.css";
import * as d3 from "d3"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {wordFrequency:[]};
  }
  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  getWordFrequency = (text) => {
    const stopWords = new Set(["the", "and", "a", "an", "in", "on", "at", "for", "with", "about", "as", "by", "to", "of", "from", "that", "which", "who", "whom", "this", "these", "those", "it", "its", "they", "their", "them", "we", "our", "ours", "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "it", "its", "we", "us", "our", "ours", "they", "them", "theirs", "I", "me", "my", "myself", "you", "your", "yourself", "yourselves", "was", "were", "is", "am", "are", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "as", "if", "each", "how", "which", "who", "whom", "what", "this", "these", "those", "that", "with", "without", "through", "over", "under", "above", "below", "between", "among", "during", "before", "after", "until", "while", "of", "for", "on", "off", "out", "in", "into", "by", "about", "against", "with", "amongst", "throughout", "despite", "towards", "upon", "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't", "doesn't", "didn't", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't", "shouldn't", "mustn't", "needn't", "daren't", "hasn't", "haven't", "hadn't"]);
    const words = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=_`~()]/g, "").replace(/\s{2,}/g, " ").split(" ");
    const filteredWords = words.filter(word => !stopWords.has(word));
    return Object.entries(filteredWords.reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {}));
  }

  renderChart() {
    const data = this.state.wordFrequency.sort((a, b) => b[1] - a[1]).slice(0, 5);

    const svg = d3.select(".svg_parent");
    const width = 1000, height = 350, padding = 40;
    svg.attr("width", width).attr("height", height);

    if (!data.length) {
      svg.selectAll("*").remove();
      return;
    }

    // Determine font sizes based on frequencies
    const maxFreq = d3.max(data, d => d[1]) || 1;
    const sizeScale = d3.scaleLinear().domain([0, maxFreq]).range([24, 80]);

    // Create a hidden text element for measuring word sizes
    let measurer = svg.select("text.__measure");
    if (measurer.empty()) {
      measurer = svg.append("text")
        .attr("class", "__measure")
        .attr("x", -9999).attr("y", -9999)
        .style("visibility", "hidden");
    }

    // Measure widths at target sizes
    const sizes = data.map(d => sizeScale(d[1]));
    const widths = data.map((d, i) => {
      measurer.text(d[0]).style("font-size", sizes[i] + "px");
      return measurer.node().getBBox().width;
    });

    // Compute gaps and available space
    const gap = 40; // px between words
    const available = (width - 2 * padding) - gap * (data.length - 1);
    const sumWidths = d3.sum(widths);

    // If words don't fit, scale down sizes proportionally
    if (sumWidths > available) {
      const k = available / sumWidths;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] *= k;
        measurer.text(data[i][0]).style("font-size", sizes[i] + "px");
        widths[i] = measurer.node().getBBox().width;
      }
    }

    // Compute centers
    const centers = [];
    let xCursor = padding;
    for (let i = 0; i < data.length; i++) {
      centers.push(xCursor + widths[i] / 2);
      xCursor += widths[i] + gap;
    }

    // Remove measurer
    measurer.remove();  
    const yCenter = height / 2;
    const words = svg.selectAll("text.word").data(data, d => d[0]);

    // ENTER
    const enter = words.enter()
      .append("text")
      .attr("class", "word")
      .attr("x", (_d, i) => centers[i])
      .attr("y", yCenter)
      .attr("text-anchor", "middle")
      .style("dominant-baseline", "middle")
      .style("fill", "black")
      .style("opacity", 0)
      .style("font-size", "1px")
      .text(d => d[0]);

    enter.transition()
      .duration(900)
      .style("opacity", 1)
      .style("font-size", (_d, i) => sizes[i] + "px");

    // UPDATE
    words.transition()
      .duration(900)
      .attr("x", (_d, i) => centers[i])
      .attr("y", yCenter)
      .style("font-size", (_d, i) => sizes[i] + "px");

    // EXIT
    words.exit()
      .transition().duration(500)
      .style("opacity", 0)
      .remove();
  }


  render() {
    return (
      <div className="parent">
        <div className="child1" style={{width: 1000 }}>
        <textarea type="text" id="input_field" style={{ height: 150, width: 1000 }}/>
          <button type="submit" value="Generate Matrix" style={{ marginTop: 10, height: 40, width: 1000 }} onClick={() => {
                var input_data = document.getElementById("input_field").value
                this.setState({wordFrequency:this.getWordFrequency(input_data)})
              }}
            > Generate WordCloud</button>
        </div>
        <div className="child2"><svg className="svg_parent"></svg></div>
      </div>
    );
  }
}

export default App;
