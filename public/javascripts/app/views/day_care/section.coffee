class Kin.DayCare.SectionView extends Backbone.View
  
  el: null

  tplUrl: '/templates/main/day_care/{sectionName}.html'

  tagInputsTplUrl: '/templates/main/day_care/tag_inputs.html'

  tagListTplUrl: '/templates/main/day_care/tag_list.html'

  tagFormTplUrl: '/templates/main/day_care/tag_form.html'

  model: null

  events:
    "submit #edit-section-form": "submitSectionFormHandler"

  initialize: (options)->

  getTags: (type, callback)->
    tags = new Kin.TagsCollection [], {type: type}
    tags.fetch
      success: (collection)->
        callback(collection.models)

  render: ()->
    that = @
    tplUrl = @tplUrl.replace("{sectionName}", @model.get("name")).replace(/-/g, "_")
    $.tmpload
      url: tplUrl
      onLoad: (tpl)->
        that.model.fetch
          success: (model)->
            $(that.el).html(tpl({section: model, view: that}))
            that.$(".chzn-select").chosen()

  renderTagInputs: (type, tags, selectedTags, add = false)->
    that = @
    tpl = $.tmpload
      url: @tagInputsTplUrl
      onLoad: (tpl)->
        $list = that.$("##{type}-inputs")
        if add
          $list.append(tpl({type: type, tags: tags, selectedTags: selectedTags}))
        else
          $list.html(tpl({type: type, tags: tags, selectedTags: selectedTags}))
          that.renderTagForm($list, type)

  renderTagList: (type, tags, selectedTags)->
    that = @
    tpl = $.tmpload
      url: @tagListTplUrl
      onLoad: (tpl)->
        that.$("##{type}-list").html(tpl({type: type, tags: tags, selectedTags: selectedTags}))

  renderTagForm: ($list, type)=>
    that = @
    tpl = $.tmpload
      url: @tagFormTplUrl
      onLoad: (tpl)->
        formHtml = tpl({type: type})
        $list.after(formHtml)
        $list.next("form").bind "submit", that.submitAddTagFormHandler

  displayTagInputs: (type)->
    that = @
    selectedTags = @model.get(type)
    @getTags type, (tags)->
      that.renderTagInputs(type, tags, selectedTags)

  displayTagList: (type)->
    that = @
    selectedTags = @model.get(type)
    @getTags type, (tags)->
      that.renderTagList(type, tags, selectedTags)

  submitSectionFormHandler: (ev)->
    ev.preventDefault()
    $form = $(ev.target)
    formData = $form.serialize()
    @model.save null
      data: formData
      success: ()->
        $.jGrowl("Data was successfully saved.")
      error: ()->
        $.jGrowl("Data could not be saved :( Please try again.")

  submitAddTagFormHandler: (ev)=>
    ev.preventDefault()
    that = @
    $form = $(ev.target)
    formData = $form.serialize()
    tag = new Kin.TagModel
    tag.save null
      data: formData
      success: (model)->
        that.renderTagInputs(model.get("type"), [model], [model.get("_id")], true)
        $form.find("input[name='name']").val("")
      error: ()->
        $.jGrowl("Tag could not be saved :( Please try again.")

  remove: ()->
    @unbind()
    $(@el).unbind().empty()
