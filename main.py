import os
import webapp2
import jinja2

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
        template_values = {
            'kb': 6,    # I could unpickle `kevinBacon.pickle` to get the actual number, but performance.
        }
        template = JINJA_ENVIRONMENT.get_template('main.html')
        self.response.write(template.render(template_values))


app = webapp2.WSGIApplication([
    ("/", MainPage),
], debug=True)