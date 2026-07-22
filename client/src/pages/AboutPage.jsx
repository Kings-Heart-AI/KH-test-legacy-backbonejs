export default function AboutPage() {
    return (
        <div>
            <div className="row-fluid">
                <img className="about-icon" src="/img/download.png" width="50" alt="" />
                <h4>Download the source code</h4>
                <p>The source code for this application is available in this repository on GitHub.</p>
            </div>

            <br />

            <div className="row-fluid">
                <img className="about-icon" src="/img/discuss.png" width="50" alt="" />
                <h4>Comments and questions</h4>
                <p>I love to hear your feedback. Post your questions and comments on the blog post associated with this application.</p>
            </div>

            <br />

            <div className="row-fluid">
                <img className="about-icon" src="/img/twitter.png" width="50" alt="" />
                <h4>Follow me on Twitter</h4>
                <p><a href="http://twitter.com/ccoenraets">@ccoenraets</a></p>
            </div>

            <br />

            <div className="row-fluid">
                <img className="about-icon" src="/img/blog.png" width="50" alt="" />
                <h4>Check out my blog</h4>
                <p><a href="http://coenraets.org">http://coenraets.org</a></p>
            </div>
        </div>
    );
}
