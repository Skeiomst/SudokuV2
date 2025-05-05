from flask import Blueprint, jsonify, request
from app.models import tbldifficulty, tbltemplate, tblplayed
from app import db
import random
from app.services.sudoku_masker import SudokuMasker
import json

api_bp = Blueprint('api', __name__)

@api_bp.route('/difficulties', methods=['GET'])
def get_difficulties():
    difficulties = tbldifficulty.query.filter_by(active=True).all()

    if not difficulties:
        return jsonify({'error': 'Difficulties not found'}), 404

    difficulties_list = [{
        'iddifficulty': diff.iddifficulty,
        'name': diff.name,
        'active': diff.active
    } for diff in difficulties]

    return jsonify(difficulties_list)

@api_bp.route('/sudoku/generate/<int:iddifficulty>', methods=['GET'])
def get_templates(iddifficulty):
    templates = tbltemplate.query.filter_by(iddifficulty=iddifficulty, active=True).all()

    if not templates:
        return jsonify({'error': 'Templates not found'}), 404

    template = random.choice(templates)
    print(template.grid)

    masked_data = SudokuMasker.mask_grid(
        solution = template.grid,
        difficulty = iddifficulty
    )

    return jsonify({
        'idtemplate': template.idtemplate,
        'puzzle' : masked_data['puzzle'],
        'mask' : masked_data['mask'],
        'difficulty' : iddifficulty,
        'stats' : {
            'hidden_cells' : masked_data['hidden_cells'],
            'visible_cells' : 81 - masked_data['hidden_cells']
        }
    })

@api_bp.route('/sudoku/validate', methods=['POST'])
def validate_solution():
    data = request.get_json()
    idtemplate = data.get('idtemplate')
    user_solution = data.get('solution')

    if not idtemplate or not user_solution:
        return jsonify({'error': 'Missing required fields'}), 400

    puzzle = tbltemplate.query.get(idtemplate)

    if not puzzle:
        return jsonify({'error': 'Template not found'}), 404

    is_valid = user_solution == puzzle.grid

    return jsonify(
        {'is_valid': is_valid,
         'idtemplate': idtemplate        
        })

@api_bp.route('/sudoku/validate-cell', methods=['POST'])
def validate_cell():
    data = request.get_json()
    puzzle_id = data.get('puzzle_id')
    row = data.get('row')
    col = data.get('col')
    value = data.get('value')
    
    if None in [puzzle_id, row, col, value]:
        return jsonify({'error': 'Missing parameters'}), 400
    
    puzzle = tbltemplate.query.get(puzzle_id)
    if not puzzle:
        return jsonify({'error': 'Puzzle not found'}), 404
    
    is_correct = False
    if 0 <= row < 9 and 0 <= col < 9:
        solution = json.loads(puzzle.grid) 
        is_correct = (value == solution[row][col])
    
    return jsonify({
        'valid': is_correct,
        'correct_value': solution[row][col] if not is_correct else None
    })

@api_bp.route('/played', methods=['POST'])
def game_played():
    data = request.get_json()

    required_fields = ['idtemplate', 'nickname', 'timeused', 'playat']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        new_played = tblplayed(
            idtemplate=data['idtemplate'],
            nickname=data['nickname'],
            timeused=data['timeused'],
            playat=data['playat']
        )

        db.session.add(new_played) 
        db.session.commit()

        return jsonify({'message': 'Game played successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
