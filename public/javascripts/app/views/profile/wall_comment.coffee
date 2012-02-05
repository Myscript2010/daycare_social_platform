class Kin.Profile.WallCommentView extends Backbone.View

  tagName: 'li'

  tplUrl: '/templates/main/profile/wall_comment.html'

  initialize: ()->
    @model and @model.view = @

  render: ()->
    that = @
    $.tmpload
      url: @tplUrl
      onLoad: (tpl)->
        $(that.el).addClass(that.model.get("type")).attr("data-id", that.model.get("_id")).html(tpl({comment: that.model}))
        that.$(".time").timeago()
        if that.model.get("type") is "status"
          that.$(".add-followup-form:first textarea").autoResize
            extraSpace: -2

          that.$('a[rel^="prettyPhoto"]').prettyPhoto
            slideshow: false
            social_tools: false
            theme: 'light_rounded'
            deeplinking: false
            animation_speed: 0

        that.$(".edit-comment").bind("click", that.editCommentHandler)
        that.$(".delete-comment").bind("click", that.deleteCommentHandler)

  editCommentHandler: (ev)=>
    ev.preventDefault()
    that = @
    if typeof @model.get("content") is "string"
      @$(".comment-text:first").doomEdit
        autoTrigger: true
        ajaxSubmit: false
        submitOnBlur: true
        submitBtn: false
        cancelBtn: false
        editField: '<textarea name="content" class="comment-edit-textarea"></textarea>'
        showOnEvent: false
        afterFormSubmit: (data, form, $el)->
          $el.text(data)
          that.model.save({content: data}, {silent: true})

  deleteCommentHandler: (ev)=>
    ev.preventDefault()
    that = @
    dConfirm "Are you sure you want to remove the comment?", (btType, win)->
  		  if btType is "yes"
          win.close()
          that.model.destroy()
          $(that.el).remove()
        if btType in ["no", "close"]
          win.close()
