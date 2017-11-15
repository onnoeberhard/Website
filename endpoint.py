# Note: Unused, Unifinished, Unfunctional.

import endpoints
from protorpc import message_types
from protorpc import messages
from protorpc import remote


class Notice(messages.Message):
    msg = messages.StringField(1)


@endpoints.api(name='tau', version='v1')
class TauApi(remote.Service):
    @endpoints.method(
        message_types.VoidMessage,
        Notice,
        path='test',
        http_method='GET',
        name='test')
    def echo_api_key(self, request):
        return Notice(msg="Hello World!")


api = endpoints.api_server([TauApi])
