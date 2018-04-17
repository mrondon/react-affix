import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class Affix extends Component {
    constructor(props) {
        super(props);
        this.calculate = this.calculate.bind(this);
        this.getInitPosition = this.getInitPosition.bind(this);
        this.getContainerDOM = this.getContainerDOM.bind(this);
        this.handleTargetChange = this.handleTargetChange.bind(this);
    }

    state = {
        affixed: false,
        initTop: 0,
        initLeft: 0,
        marginTop: 0,
        marginLeft: 0,
        height: 0,
        width: 0,
        containerHeight: 0,
        containerWidth: 0,
    }

    componentDidMount() {
        this.getInitPosition();
        const listenTarget = this.props.target();
        if (listenTarget) {
            listenTarget.addEventListener('resize', this.handleTargetChange)
            listenTarget.addEventListener('scroll', this.handleTargetChange)
        }
    }

    componentWillUnmount() {
        const listenTarget = this.props.target();
        if (listenTarget) {
            listenTarget.removeEventListener('scroll', this.handleTargetChange)
            listenTarget.removeEventListener('resize', this.handleTargetChange)
        }
    }

    getContainerDOM() {
        const container = this.props.container;
        if (container != document.body) {
            return ReactDOM.findDOMNode(container);
        }
        return container;
    }

    getInitPosition() {
        const container = this.getContainerDOM()
        const thisElm = ReactDOM.findDOMNode(this);

        this.setState({
            height: thisElm.offsetHeight,
            width: thisElm.offsetWidth,
            containerHeight: container.offsetHeight,
            containerWidth: container.offsetWidth,
        })

        const containerRect = container.getBoundingClientRect();
        const thisElemRect = thisElm.getBoundingClientRect();

        let { top, left } = thisElemRect;
        const marginTop = top - containerRect.top;
        const marginLeft = left - containerRect.left;

        this.setState({
            top: top,
            left: left,
            initTop: top,
            initLeft: left,
            marginTop: marginTop,
            marginLeft: marginLeft
        });
    }

    handleTargetChange(evt) {
        const container = this.getContainerDOM()
        const { top, left } = container.getBoundingClientRect()

        this.setState({
            top: top + this.state.marginTop,
            left: left + this.state.marginLeft,
            containerHeight: container.offsetHeight,
            containerWidth: container.offsetWidth,
        })

        if (this.state.top <= this.props.offsetTop) {
            if ( this.state.affixed == false) {
                this.props.onChange({ affixed: true, event: evt})
            }
            this.setState({ affixed: true })
        }

        if (this.state.top > this.props.offsetTop) {
            if ( this.state.affixed == true) {
                this.props.onChange({ affixed: false, event: evt})
            }
            this.setState({ affixed: false })
        }

        this.props.onTargetChange(this.state)
    }

    calculate() {
        let h = (this.state.top - this.state.marginTop + this.state.containerHeight) - this.state.height;
        let fixStyle = {};
        let boxStyle = {};
        if (this.state.top < this.props.offsetTop) {
            fixStyle = {
                position: "fixed",
                top: h < 0 ? h : Math.min(h, this.props.offsetTop),
                left: this.props.horizontal ? this.state.initLeft : this.state.left,
                height: this.state.height,
                width: this.state.width,
                zIndex: this.props.zIndex,
            }
            boxStyle = {height: this.state.height}
        }
        return {fixStyle, boxStyle}
    }

    render() {
        const { fixStyle, boxStyle }= this.calculate()
        return (
            <div className="affix">
                <div className="affix-holder" style={boxStyle}/>
                <div className="affix-wrapper" style={fixStyle}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

Affix.propTypes = {
    container: PropTypes.object,
    offsetTop: PropTypes.number,
    horizontal: PropTypes.bool,
    target: PropTypes.func,
    onChange: PropTypes.func,
    onTargetChange: PropTypes.func,
    zIndex: PropTypes.number,
}

Affix.defaultProps = {
    offsetTop: 0,
    horizontal: false,
    container: document.body,
    target: () => window,
    onChange: (affixed) => ({}),
    onTargetChange: (state) => ({}),
    zIndex: 2,
}


export default Affix;
